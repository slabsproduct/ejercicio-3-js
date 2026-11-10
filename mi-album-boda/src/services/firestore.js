// src/services/firestore.js
// ============================================================================
// Capa de acceso a datos: toda la lógica de Firestore y Storage vive aquí.
// Los componentes nunca importan el SDK directamente => fácil de testear/mantener.
// Sin Cloud Functions: la validación real del código se hace con las reglas
// de seguridad (firestore.rules / storage.rules).
// ============================================================================
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

/** Clave usada en sessionStorage para recordar el evento validado. */
export const SESSION_KEY = 'album_event_code';

/** Normaliza el código: mayúsculas, sin espacios extra. Ej: "boda ana y juan" -> "BODA-ANA-Y-JUAN" */
export function normalizeEventCode(raw) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-');
}

// ----------------------------------------------------------------------------
// EVENTOS
// ----------------------------------------------------------------------------

/**
 * Valida un código de evento consultando Firestore por documento exacto.
 * No se usa "where()" para evitar requerir índices y para que sea imposible
 * enumerar eventos: solo funciona si el ID es exactamente correcto.
 * @returns {Promise<{exists:boolean, data?:object}>}
 */
export async function validateEventCode(eventCode) {
  const code = normalizeEventCode(eventCode);
  if (!code) return { exists: false };

  try {
    const snap = await getDoc(doc(db, 'events', code));
    if (!snap.exists()) return { exists: false };

    const data = snap.data();
    // El evento debe estar activo para permitir subir fotos.
    return { exists: true, data: { id: code, ...data } };
  } catch (error) {
    // Reglas de seguridad deniegan lectura => lo tratamos como código inválido.
    console.error('[firestore] Error validando código:', error.code ?? error);
    return { exists: false, error };
  }
}

/**
 * Crea un evento nuevo (modo administrador de la app).
 * Las reglas de firestore.rules exigen el PIN de creación correcto.
 */
export async function createEvent({ eventCode, title, date, location, pin }) {
  const code = normalizeEventCode(eventCode);
  if (!code || !title) throw new Error('Código y título son obligatorios.');

  const payload = {
    event_code: code,
    title,
    date: date || null,
    location: location || null,
    active: true,
    valido: true,       // Campo exigido por las reglas de creación
    pin,               // PIN de administración (se valida en las reglas)
    createdAt: serverTimestamp(),
  };

  // setDoc con ID explícito: si el código ya existe, lanzamos error amigable.
  const existing = await getDoc(doc(db, 'events', code));
  if (existing.exists()) throw new Error('Ese código de evento ya existe.');

  await setDoc(doc(db, 'events', code), payload);
  return code;
}

// ----------------------------------------------------------------------------
// FOTOS (subcolección events/{code}/photos)
// ----------------------------------------------------------------------------

/**
 * Suscripción en tiempo real a las últimas N fotos del evento.
 * @param {string} eventCode
 * @param {(photos: Array) => void} callback - recibe array ordenado (más nuevas primero)
 * @param {number} max - cantidad máxima en vivo (para no gastar lecturas gratis)
 * @returns {() => void} función para cancelar la suscripción
 */
export function subscribeToPhotos(eventCode, callback, max = 200) {
  const q = query(
    collection(db, 'events', eventCode, 'photos'),
    orderBy('uploadedAt', 'desc'),
    limit(max)
  );

  return onSnapshot(
    q,
    (snap) => {
      const photos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(photos);
    },
    (error) => {
      console.error('[firestore] Error en la suscripción de fotos:', error.code ?? error);
      callback([]);
    }
  );
}

/**
 * Sube una imagen comprimida a Storage y registra su documento en Firestore.
 * Se suben DOS versiones (thumb + full) usando la misma ruta de carpetas
 * exigida por storage.rules: events/{code}/thumbs/... y events/{code}/full/...
 *
 * @param {string} eventCode - Código ya validado (se re-verifica en reglas).
 * @param {File|Blob} thumbBlob - Versión pequeña (<300KB, máx 400px).
 * @param {File|Blob} fullBlob  - Versión completa (<2MB, máx 1200px).
 * @param {object} meta - { uploaderName?, caption?, onProgress?(pct) }
 * @returns {Promise<string>} id del documento creado.
 */
export async function uploadPhoto(eventCode, thumbBlob, fullBlob, meta = {}) {
  const { uploaderName = '', caption = '', onProgress } = meta;
  const code = normalizeEventCode(eventCode);

  try {
    // Nombre único basado en timestamp + aleatorio (evita colisiones).
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const thumbRef = ref(storage, `events/${code}/thumbs/${baseName}.jpg`);
    const fullRef = ref(storage, `events/${code}/full/${baseName}.jpg`);

    // Subidas resumibles con progreso (útil en redes móviles lentas).
    const metadata = { contentType: 'image/jpeg' };
    const thumbTask = uploadBytesResumable(thumbRef, thumbBlob, metadata);
    const fullTask = uploadBytesResumable(fullRef, fullBlob, metadata);

    let done = 0;
    const trackProgress = () => {
      const t = thumbTask.snapshot?.bytesTransferred ?? 0;
      const f = fullTask.snapshot?.bytesTransferred ?? 0;
      const total = (thumbTask.snapshot?.totalBytes ?? 1) + (fullTask.snapshot?.totalBytes ?? 1);
      done = Math.min(99, Math.round(((t + f) / total) * 100));
      onProgress?.(done);
    };
    thumbTask.on('state_changed', trackProgress, null, trackProgress);
    fullTask.on('state_changed', trackProgress, null, trackProgress);

    await Promise.all([thumbTask, fullTask]);

    // URLs de descarga estables para la galería y el modal.
    const [thumbUrl, fullUrl] = await Promise.all([
      getDownloadURL(thumbRef),
      getDownloadURL(fullRef),
    ]);

    // Documento en Firestore: las reglas rechazan escrituras con evento inexistente/inactivo.
    const photoDoc = {
      event_code: code,
      thumbUrl,
      fullUrl,
      thumbPath: `events/${code}/thumbs/${baseName}.jpg`,
      fullPath: `events/${code}/full/${baseName}.jpg`,
      uploaderName: String(uploaderName).slice(0, 60), // límite defensivo
      caption: String(caption).slice(0, 200),
      uploadedAt: serverTimestamp(),
    };

    const created = await addDoc(collection(db, 'events', code, 'photos'), photoDoc);
    onProgress?.(100);
    return created.id;
  } catch (error) {
    console.error('[firestore] Error al subir foto:', error.code ?? error);
    throw error; // El componente muestra el mensaje amigable.
  }
}

// src/App.jsx
// ============================================================================
// Orquestador de la aplicación:
// 1. Lee sessionStorage (y ?code= de la URL del QR) para saber si hay acceso.
// 2. Si no hay sesión válida => muestra CodeLogin.
// 3. Si la hay => revalida el código contra Firestore y muestra la galería,
//    el uploader y el modal.
// Toda la lógica es 100% cliente (Plan Spark, sin Cloud Functions).
// ============================================================================
import { useEffect, useState } from 'react';
import { LogOut, Camera, Loader2 } from 'lucide-react';
import CodeLogin from './components/CodeLogin';
import PhotoUploader from './components/PhotoUploader';
import GalleryGrid from './components/GalleryGrid';
import ImageModal from './components/ImageModal';
import {
  validateEventCode,
  subscribeToPhotos,
  normalizeEventCode,
  SESSION_KEY,
} from './services/firestore';

export default function App() {
  // Evento validado ({id, title, active, ...}) o null si no hay sesión.
  const [event, setEvent] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Fotos en tiempo real + estado del modal.
  const [photos, setPhotos] = useState([]);
  const [modalIndex, setModalIndex] = useState(null); // null = modal cerrado

  // ------------------------------------------------------------------
  // RE-HIDRATACIÓN DE SESIÓN: sessionStorage primero, ?code= del QR después.
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        // a) ¿Ya validamos el código en esta pestaña?
        let code = sessionStorage.getItem(SESSION_KEY);

        // b) ¿Vienen con el enlace del QR (?code=BODA-...)? Acceso un clic.
        if (!code) {
          const urlCode = new URLSearchParams(window.location.search).get('code');
          if (urlCode) code = normalizeEventCode(urlCode);
        }

        if (!code) return; // No hay sesión: se mostrará CodeLogin.

        // c) Revalidación: el evento podría haber sido cerrado/eliminado.
        const result = await validateEventCode(code);
        if (!cancelled && result.exists) {
          sessionStorage.setItem(SESSION_KEY, result.data.id);
          setEvent(result.data);
        } else if (!cancelled) {
          sessionStorage.removeItem(SESSION_KEY); // Código inválido => fuera.
        }
      } catch (err) {
        console.error('[App] Error restaurando sesión:', err);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------------
  // SUSCRIPCIÓN EN TIEMPO REAL a las fotos del evento validado.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!event?.id) return;
    // onSnapshot devuelve su propia función de limpieza (unsubscribe).
    return subscribeToPhotos(event.id, setPhotos);
  }, [event?.id]);

  /** El login tuvo éxito: guardamos el código en sessionStorage. */
  function handleAccessGranted(eventData) {
    sessionStorage.setItem(SESSION_KEY, eventData.id);
    setEvent(eventData);
  }

  /** Cerrar sesión: limpia sessionStorage y vuelve al login. */
  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setEvent(null);
    setPhotos([]);
    setModalIndex(null);
  }

  // Pantalla de carga mientras revalidamos la sesión.
  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-boda-50 gap-3">
        <Loader2 className="animate-spin text-boda-500" size={36} />
        <p className="text-boda-700 text-sm">Comprobando tu acceso…</p>
      </div>
    );
  }

  // Sin sesión válida: solo pedimos el código.
  if (!event) {
    return <CodeLogin onAccessGranted={handleAccessGranted} />;
  }

  // ------------------------- GALERÍA PRINCIPAL -------------------------
  const eventActive = event.active !== false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-boda-50 to-boda-100">
      {/* Barra superior con nombre del evento y salida */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-boda-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-lg md:text-xl text-boda-900 truncate">
              {event.title || 'Álbum del Evento'}
            </h1>
            <p className="text-[11px] text-boda-500 truncate">
              {event.id} {event.date ? ` · ${event.date}` : ''}
              {event.location ? ` · ${event.location}` : ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-boda-700 hover:text-boda-900 shrink-0"
            aria-label="Salir del álbum"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Aviso si el evento fue cerrado (ya no se pueden subir fotos) */}
        {!eventActive && (
          <p className="bg-amber-50 text-amber-800 text-sm rounded-xl p-3 border border-amber-200">
            Este evento fue cerrado: puedes ver las fotos pero ya no se admiten subidas.
          </p>
        )}

        {/* Subida de fotos (compresión en cliente incluida) */}
        <PhotoUploader eventCode={event.id} active={eventActive} />

        {/* Galería responsive con lazy loading */}
        <GalleryGrid
          photos={photos}
          onPhotoClick={(photo) => setModalIndex(photos.findIndex((p) => p.id === photo.id))}
        />

        <footer className="text-center pb-8 pt-2">
          <p className="text-xs text-boda-500 flex items-center justify-center gap-1.5">
            <Camera size={12} /> Hecho con ❤️ · Firebase Plan Spark · sin descargas
          </p>
        </footer>
      </main>

      {/* Modal de alta calidad (se monta solo cuando hay índice válido) */}
      {modalIndex !== null && photos[modalIndex] && (
        <ImageModal
          photos={photos}
          index={modalIndex}
          onNavigate={setModalIndex}
          onClose={() => setModalIndex(null)}
        />
      )}
    </div>
  );
}

// src/components/PhotoUploader.jsx
// ============================================================================
// Subida de fotos (CRÍTICO):
// - Un solo <input type="file" accept="image/*" multiple> permite al navegador
//   ofrecer "Galería" o "Cámara" (en iOS/Android aparece el menú nativo).
// - Botón dedicado con capture="environment" para abrir la cámara trasera.
// - Cada archivo pasa por prepareImageForUpload() => compresión 100% en cliente
//   (thumb <=400px/<300KB, full <=1200px/<2MB) ANTES de tocar Firebase.
// ============================================================================
import { useRef, useState } from 'react';
import { Camera, ImageUp, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { uploadPhoto } from '../services/firestore';
import { prepareImageForUpload, formatBytes } from '../utils/imageCompressor';

export default function PhotoUploader({ eventCode, active = true }) {
  const galleryInputRef = useRef(null); // input sin capture => galería o cámara
  const cameraInputRef = useRef(null);  // input con capture="environment" => cámara trasera

  const [uploaderName, setUploaderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // {type:'ok'|'error', msg:string}
  const [queue, setQueue] = useState([]);      // [{name, state, pct}] feedback por archivo

  /** Procesa y sube la lista de archivos seleccionada. */
  async function handleFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    setStatus(null);
    setUploading(true);
    setQueue(files.map((f) => ({ name: f.name, state: 'pending', pct: 0 })));

    let ok = 0;
    let fail = 0;

    // Secuencial (no paralelo) para no saturar CPU móvil ni el ancho de banda.
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      updateQueue(i, { state: 'compressing', pct: 0 });
      try {
        // 1) COMPRESIÓN EN EL NAVEGADOR (requisito obligatorio del proyecto)
        const { thumb, full, originalSize } = await prepareImageForUpload(file);
        updateQueue(i, { state: 'uploading', pct: 5 });

        // 2) SUBIDA a Storage + documento en Firestore
        await uploadPhoto(eventCode, thumb, full, {
          uploaderName,
          onProgress: (pct) => updateQueue(i, { pct }),
        });

        ok++;
        updateQueue(i, { state: 'done', pct: 100 });
        console.info(
          `[compresión] ${file.name}: ${formatBytes(originalSize)} → ` +
            `${formatBytes(thumb.size)} (thumb) + ${formatBytes(full.size)} (full)`
        );
      } catch (err) {
        fail++;
        updateQueue(i, { state: 'error', pct: 100 });
        console.error('[PhotoUploader] Error:', err?.code ?? err);
      }
    }

    setUploading(false);
    if (fail === 0) {
      setStatus({ type: 'ok', msg: `✅ ${ok} foto(s) subida(s). ¡Gracias por compartir el momento!` });
    } else {
      setStatus({
        type: 'error',
        msg: `${ok} exitosa(s), ${fail} con error. Revisa tu conexión e inténtalo otra vez.`,
      });
    }
    // Limpia los inputs para poder re-seleccionar el mismo archivo.
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  /** Actualiza el estado de un elemento de la cola de forma inmutable. */
  function updateQueue(index, patch) {
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  // El evento fue cerrado por los organizadores: ocultamos la subida.
  if (!active) return null;

  return (
    <section className="bg-white rounded-2xl shadow-md border border-boda-100 p-4 md:p-6 space-y-4">
      <h2 className="font-serif text-xl text-boda-900 flex items-center gap-2">
        <Camera size={20} className="text-boda-500" /> Comparte tus fotos
      </h2>

      {/* Nombre opcional del invitado (se guarda con cada foto) */}
      <input
        type="text"
        placeholder="Tu nombre (opcional)"
        value={uploaderName}
        maxLength={60}
        onChange={(e) => setUploaderName(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-boda-100 focus:outline-none focus:ring-2 focus:ring-boda-500 text-sm"
        disabled={uploading}
      />

      {/* Botones de selección: galería / cámara trasera */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-boda-700 hover:bg-boda-900 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          <ImageUp size={18} /> Galería
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-boda-700 text-boda-700 hover:bg-boda-50 disabled:opacity-50 font-semibold transition-colors"
        >
          <Camera size={18} /> Cámara
        </button>
      </div>

      {/* INPUTS OCULTOS: aceptan solo imágenes; capture abre cámara trasera */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Cola de procesado con estados por archivo */}
      {queue.length > 0 && (
        <ul className="space-y-2 text-sm">
          {queue.map((q, i) => (
            <li key={`${q.name}-${i}`} className="flex items-center gap-2 text-boda-900">
              {q.state === 'done' && <CheckCircle2 size={16} className="text-green-600 shrink-0" />}
              {q.state === 'error' && <AlertCircle size={16} className="text-red-600 shrink-0" />}
              {(q.state === 'compressing' || q.state === 'uploading') && (
                <Loader2 size={16} className="animate-spin text-boda-500 shrink-0" />
              )}
              {q.state === 'pending' && <X size={16} className="text-boda-500/40 shrink-0" />}
              <span className="truncate flex-1">{q.name}</span>
              <span className="text-xs text-boda-500 capitalize">
                {q.state === 'compressing'
                  ? 'comprimiendo…'
                  : q.state === 'uploading'
                    ? `${q.pct}%`
                    : q.state === 'done'
                      ? 'listo ✓'
                      : q.state === 'error'
                        ? 'error ✗'
                        : 'en cola'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Barra global de progreso mientras se sube */}
      {uploading && (
        <div className="h-2 w-full rounded-full bg-boda-100 overflow-hidden">
          <div
            className="h-full bg-boda-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Mensaje final de resultado */}
      {status && (
        <p
          role="status"
          className={`rounded-lg p-3 text-sm ${
            status.type === 'ok'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {status.msg}
        </p>
      )}

      <p className="text-xs text-boda-500">
        Tus fotos se comprimen en tu teléfono antes de subirse (máx. 2&nbsp;MB). No ocupamos tu
        almacenamiento ni superamos el plan gratuito.
      </p>
    </section>
  );
}

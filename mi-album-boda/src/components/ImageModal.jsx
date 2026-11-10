// src/components/ImageModal.jsx
// ============================================================================
// Modal de visualización: muestra la versión de ALTA CALIDAD (fullUrl),
// permite navegación anterior/siguiente, descarga directa y cierre con ESC
// o clic en el fondo. Accesible: foco inicial, role="dialog", trapeo de teclado.
// ============================================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Loader2, User, CalendarDays } from 'lucide-react';

export default function ImageModal({ photos = [], index = 0, onClose, onNavigate }) {
  const photo = photos[index];
  const closeRef = useRef(null);
  const [loadingImg, setLoadingImg] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Resetear estados al cambiar de foto dentro del modal.
  useEffect(() => {
    setLoadingImg(true);
    setImgError(false);
  }, [photo?.id]);

  // Foco inicial en el botón cerrar (accesibilidad).
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Navegación por teclado: ESC cierra, flechas navegan.
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onNavigate(index + 1);
    },
    [index, photos.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    // Bloquea el scroll del fondo mientras el modal está abierto.
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!photo) return null;

  /** Descarga la versión de alta calidad usando un enlace temporal. */
  function handleDownload() {
    try {
      const a = document.createElement('a');
      a.href = photo.fullUrl;
      a.download = `foto-${photo.id}.jpg`;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('[ImageModal] Descarga fallida:', err);
    }
  }

  // Fecha legible del documento (serverTimestamp puede llegar como objeto).
  const dateText = photo.uploadedAt?.toDate
    ? photo.uploadedAt.toDate().toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de foto"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2"
      onClick={onClose} // clic en el fondo cierra
    >
      {/* Contenido: detiene la propagación para no cerrar al hacer clic dentro */}
      <div
        className="relative max-w-4xl w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-2 right-0 md:right-0 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Imagen de alta calidad */}
        <div className="relative w-full flex items-center justify-center min-h-[50vh]">
          {loadingImg && !imgError && (
            <Loader2 className="absolute text-white animate-spin" size={40} />
          )}
          {imgError ? (
            <p className="text-white/80 text-sm p-8">
              No se pudo cargar la imagen. Inténtalo más tarde.
            </p>
          ) : (
            <img
              src={photo.fullUrl}
              alt={photo.caption || 'Foto del evento en alta calidad'}
              onLoad={() => setLoadingImg(false)}
              onError={() => setImgError(true)}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg select-none"
            />
          )}
        </div>

        {/* Flechas de navegación (solo si hay más de una foto) */}
        {photos.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => index > 0 && onNavigate(index - 1)}
              disabled={index === 0}
              aria-label="Foto anterior"
              className="pointer-events-auto m-2 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              onClick={() => index < photos.length - 1 && onNavigate(index + 1)}
              disabled={index === photos.length - 1}
              aria-label="Foto siguiente"
              className="pointer-events-auto m-2 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        )}

        {/* Pie del modal: info + acciones */}
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-3 text-white/90 text-sm px-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <User size={14} /> {photo.uploaderName || 'Invitado'}
            </span>
            {dateText && (
              <span className="flex items-center gap-1.5 text-white/70">
                <CalendarDays size={14} /> {dateText}
              </span>
            )}
            {photo.caption && <em className="text-white/80 truncate max-w-[220px]">“{photo.caption}”</em>}
            <span className="text-white/50 text-xs">
              {index + 1} / {photos.length}
            </span>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl bg-white/15 hover:bg-white/30 font-medium transition-colors"
          >
            <Download size={16} /> Descargar
          </button>
        </div>
      </div>
    </div>
  );
}

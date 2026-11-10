// src/components/GalleryGrid.jsx
// ============================================================================
// Galería: grid responsive mobile-first con lazy loading nativo (loading="lazy"
// + decoding="async") que muestra SOLO los thumbnails. Al hacer clic, delega
// al padre la apertura del ImageModal con la versión de alta calidad.
// ============================================================================
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

export default function GalleryGrid({ photos = [], onPhotoClick }) {
  // Contador de imágenes ya cargadas para mostrar un skeleton sutil al inicio.
  const [loadedCount, setLoadedCount] = useState(0);

  // Estado vacío: aún no hay fotos en el evento.
  if (!photos.length) {
    return (
      <section className="bg-white rounded-2xl shadow-md border border-boda-100 p-8 text-center">
        <ImageIcon className="mx-auto text-boda-500/50 mb-3" size={40} />
        <h2 className="font-serif text-xl text-boda-900">Aún no hay fotos</h2>
        <p className="text-sm text-boda-700 mt-1">
          ¡Sé el primero en compartir un momento de este evento! 📸
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Galería de fotos del evento">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="font-serif text-xl text-boda-900">Fotos del evento</h2>
        <span className="text-xs text-boda-500">{photos.length} imagen(es)</span>
      </div>

      {/* Grid: 2 columnas en móvil, 3 en tablet, 4 en escritorio */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onPhotoClick(photo)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-boda-100 focus:outline-none focus:ring-2 focus:ring-boda-500"
            aria-label={`Ver foto ${index + 1}`}
          >
            {/* Lazy loading nativo: solo descarga cuando entra en viewport */}
            <img
              src={photo.thumbUrl}
              alt={photo.caption || `Foto de ${photo.uploaderName || 'invitado'}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoadedCount((c) => c + 1)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Degradado con autor/caption al hover (visible siempre en táctil) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[11px] text-white truncate">
                {photo.uploaderName || 'Invitado'}
                {photo.caption ? ` · ${photo.caption}` : ''}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Indicador discreto mientras cargan las primeras miniaturas */}
      {loadedCount < Math.min(photos.length, 8) && (
        <p className="text-center text-xs text-boda-500 mt-3 animate-pulse">
          Cargando miniaturas…
        </p>
      )}
    </section>
  );
}

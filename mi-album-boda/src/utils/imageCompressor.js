// src/utils/imageCompressor.js
// ============================================================================
// COMPRESIÓN EN EL NAVEGADOR (obligatoria para mantener el Plan Spark gratis).
// Genera dos versiones de cada foto ANTES de tocar Firebase:
//   - Thumbnail: máx 400px de ancho, objetivo < 300KB (grid de la galería)
//   - Alta calidad: máx 1200px de ancho, objetivo < 2MB (modal y descarga)
// Usa browser-image-compression (que internamente optimiza con Web Worker
// cuando está disponible) y hace un "segundo pase" con Canvas nativo si la
// imagen sigue fuera de presupuesto.
// ============================================================================
import imageCompression from 'browser-image-compression';

const MB = 1024 * 1024;

/** Configuración de cada versión generada. */
const PRESETS = {
  thumb: {
    maxSizeMB: 0.28,        // margen bajo el límite de 300KB
    maxWidthOrHeight: 400,  // ancho máximo del thumbnail
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.75,
  },
  full: {
    maxSizeMB: 1.9,         // margen bajo el límite de 2MB
    maxWidthOrHeight: 1200, // ancho máximo en alta calidad
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
  },
};

/**
 * Segundo pase de compresión con Canvas nativo.
 * Se usa solo si browser-image-compression no alcanzó el objetivo de tamaño.
 * @param {Blob} blob - imagen ya redimensionada pero aún muy pesada
 * @param {number} maxBytes - tamaño máximo permitido
 * @returns {Promise<Blob>} JPEG recomprimido con quality decreciente
 */
async function canvasRecompress(blob, maxBytes) {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo decodificar la imagen para recomprimir.'));
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // Bajamos calidad progresivamente hasta quedar bajo el límite.
        const tryQuality = (quality) => {
          canvas.toBlob(
            (out) => {
              if (!out) return reject(new Error('Canvas no generó el blob.'));
              if (out.size <= maxBytes || quality <= 0.4) resolve(out);
              else tryQuality(quality - 0.1);
            },
            'image/jpeg',
            quality
          );
        };
        tryQuality(0.7);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Comprime una imagen según un preset y garantiza el límite de peso.
 * @param {File|Blob} file - archivo original tomado de <input type="file">
 * @param {'thumb'|'full'} preset
 * @returns {Promise<Blob>} JPEG listo para subir a Storage
 */
async function compressWithPreset(file, preset) {
  const options = { ...PRESETS[preset] };
  let result = await imageCompression(file, options);

  // Red de seguridad: si supera el presupuesto, recomprimimos con Canvas.
  const hardLimit = preset === 'thumb' ? 0.3 * MB : 2 * MB;
  if (result.size > hardLimit) {
    result = await canvasRecompress(result, hardLimit);
  }
  return result;
}

/**
 * FUNCIÓN PRINCIPAL: recibe el File del input y devuelve ambas versiones.
 * @param {File|Blob} file - foto original (de galería o cámara)
 * @returns {Promise<{thumb: Blob, full: Blob, originalSize: number}>}
 */
export async function prepareImageForUpload(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  const originalSize = file.size;

  // EXIF: browser-image-compression ya corrige la orientación (rotateToFit),
  // clave en fotos tomadas con el celular en vertical/horizontal.

  // Ambas versiones se procesan en paralelo para esperas más cortas.
  const [thumb, full] = await Promise.all([
    compressWithPreset(file, 'thumb'),
    compressWithPreset(file, 'full'),
  ]);

  return { thumb, full, originalSize };
}

/** Formatea bytes a KB/MB para mostrar al usuario el ahorro conseguido. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(2)} MB`;
}

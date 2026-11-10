// src/components/CodeLogin.jsx
// ============================================================================
// Pantalla inicial: SOLO pide el Código de Evento (sin registro ni login).
// - Valida el código contra Firestore (getDoc por ID exacto).
// - Si es válido, guarda el código en sessionStorage y concede acceso.
// - Modo administrador: permite crear un evento nuevo y generar su QR.
// ============================================================================
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { KeyRound, Loader2, AlertCircle, Sparkles, QrCode, X } from 'lucide-react';
import { validateEventCode, createEvent, normalizeEventCode } from '../services/firestore';

export default function CodeLogin({ onAccessGranted }) {
  // ---- Estado del formulario de acceso ----
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---- Estado del panel de administración (crear evento + QR) ----
  const [adminOpen, setAdminOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [pin, setPin] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdQrUrl, setCreatedQrUrl] = useState(''); // URL pública para el QR

  /** Intenta entrar al álbum validando el código introducido. */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const normalized = normalizeEventCode(code);

    if (!normalized) {
      setError('Escribe el código que recibiste (ej: BODA-ANA-Y-JUAN).');
      return;
    }

    setLoading(true);
    try {
      const result = await validateEventCode(normalized);
      if (result.exists && result.data.active !== false) {
        // ÉXITO: se concede acceso; App guardará el código en sessionStorage.
        onAccessGranted(result.data);
      } else if (result.exists && result.data.active === false) {
        setError('Este evento ya fue cerrado por los organizadores.');
      } else {
        setError('Código inválido. Verifica con los novios o revisa la invitación.');
      }
    } catch (err) {
      setError('No pudimos conectar con el servidor. Revisa tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  /** Crea el evento desde la app (requiere PIN válido según firestore.rules). */
  async function handleCreateEvent(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const newCode = await createEvent({ eventCode: code, title, date, location, pin });
      // URL actual del sitio: el QR apuntará aquí con el código pre-rellenado.
      const url = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(newCode)}`;
      setCreatedQrUrl(url);
    } catch (err) {
      setError(err.message || 'No se pudo crear el evento. Revisa el PIN de administrador.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-boda-50 to-boda-100 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Encabezado elegante estilo boda */}
        <header className="text-center mb-8">
          <Sparkles className="mx-auto text-boda-500 mb-3" size={36} />
          <h1 className="font-serif text-3xl md:text-4xl text-boda-900">Álbum del Evento</h1>
          <p className="text-boda-700 mt-2 text-sm md:text-base">
            Ingresa el código de tu invitación para ver y compartir fotos.
          </p>
        </header>

        {/* Formulario principal: solo pide el código */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-boda-100"
        >
          <label htmlFor="event-code" className="block text-sm font-medium text-boda-900">
            Código de Evento
          </label>
          <div className="relative">
            <KeyRound
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-boda-500 pointer-events-none"
            />
            <input
              id="event-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="BODA-ANA-Y-JUAN"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-boda-100 focus:outline-none focus:ring-2 focus:ring-boda-500 text-boda-900 placeholder:text-boda-500/50 uppercase tracking-wide"
              disabled={loading || creating}
            />
          </div>

          {error && (
            <p className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-xl bg-boda-700 hover:bg-boda-900 disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Validando…
              </>
            ) : (
              'Entrar al álbum'
            )}
          </button>
        </form>

        {/* ------ Panel de administrador: crear evento + QR ------ */}
        {!adminOpen && !createdQrUrl && (
          <button
            onClick={() => setAdminOpen(true)}
            className="mt-4 w-full text-center text-sm text-boda-700 underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            ¿Organizador? Crear un evento nuevo
          </button>
        )}

        {adminOpen && !createdQrUrl && (
          <form
            onSubmit={handleCreateEvent}
            className="mt-4 bg-white rounded-2xl shadow-lg p-6 space-y-3 border border-boda-100"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-boda-900">Crear evento</h2>
              <button type="button" onClick={() => setAdminOpen(false)} aria-label="Cerrar">
                <X size={18} className="text-boda-500" />
              </button>
            </div>

            {[
              { label: 'Título (ej: Ana & Juan)', state: title, set: setTitle, type: 'text' },
              { label: 'Fecha', state: date, set: setDate, type: 'date' },
              { label: 'Lugar', state: location, set: setLocation, type: 'text' },
              { label: 'PIN de administrador', state: pin, set: setPin, type: 'password' },
            ].map((f) => (
              <input
                key={f.label}
                type={f.type}
                placeholder={f.label}
                value={f.state}
                onChange={(e) => f.set(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-boda-100 focus:outline-none focus:ring-2 focus:ring-boda-500 text-sm"
                required={f.label !== 'Fecha' && f.label !== 'Lugar'}
              />
            ))}

            <button
              type="submit"
              disabled={creating || !code.trim() || !pin}
              className="w-full py-2.5 rounded-xl bg-boda-500 hover:bg-boda-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creando…
                </>
              ) : (
                <>
                  <QrCode size={16} /> Crear y generar QR
                </>
              )}
            </button>
          </form>
        )}

        {/* QR resultante: se puede imprimir/pantallazo para la invitación */}
        {createdQrUrl && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 text-center border border-boda-100">
            <h2 className="font-serif text-lg text-boda-900 mb-1">¡Evento creado! 🎉</h2>
            <p className="text-sm text-boda-700 mb-4">
              Código: <strong>{normalizeEventCode(code)}</strong>. Imprime o comparte este QR:
            </p>
            <div className="inline-block p-3 bg-white rounded-xl border border-boda-100">
              <QRCodeSVG value={createdQrUrl} size={192} level="M" includeMargin />
            </div>
            <p className="text-xs text-boda-500 mt-3 break-all">{createdQrUrl}</p>
            <button
              onClick={() => setAdminOpen(false)}
              className="mt-4 text-sm underline text-boda-700"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

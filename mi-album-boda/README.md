# 💍 Mi Álbum de Boda — Galería de Fotos Compartida por QR

Aplicación web (PWA-free, 100% en la web, **sin descargas**) para que los invitados de una boda
suban y vean fotos usando únicamente un **código de evento** accedido desde un **QR**.

- **Stack:** React 18 + Vite + Tailwind CSS + Firebase v10 (SDK modular).
- **Backend:** Solo Firestore + Storage. **Sin Cloud Functions** → funciona 100% en el **Plan Spark (gratuito)**.
- **Compresión en el navegador:** cada foto se reduce a un *thumbnail* (≤400px / <300KB) y una
  versión completa (≤1200px / <2MB) **antes** de subirse, cuidando el ancho de banda y la cuota gratis.

## 📁 Estructura

```
mi-album-boda/
├── public/favicon.svg
├── src/
│   ├── components/CodeLogin.jsx      # Acceso por código + panel admin con QR
│   ├── components/PhotoUploader.jsx  # Subida galería/cámara + compresión
│   ├── components/GalleryGrid.jsx    # Grid responsive con lazy loading
│   ├── components/ImageModal.jsx     # Alta calidad + navegación + descarga
│   ├── services/firebase.js          # Inicialización SDK modular
│   ├── services/firestore.js         # Validar evento, subir/listar fotos
│   ├── utils/imageCompressor.js      # browser-image-compression + Canvas
│   ├── App.jsx / main.jsx / index.css
├── firebase.json  firestore.rules  storage.rules
├── package.json   vite.config.js   tailwind.config.js   postcss.config.js
└── .env.example   (copiar a .env.local con tus claves reales)
```

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env.local   # pega las credenciales de tu proyecto Firebase
npm run dev                  # http://localhost:5173 (host:true => accesible por Wi-Fi/QR)
```

### Crear el proyecto Firebase (una sola vez)

```bash
npm i -g firebase-tools
firebase login
firebase init hosting firestore storage   # usa los archivos ya incluidos; NO sobrescribas rules
```

En la consola de Firebase: crea el proyecto (Plan Spark), habilita **Firestore (modo producción)**
y **Storage**, registra una **Web App** y copia las claves a `.env.local`.

## 🔐 Cómo funciona la seguridad (sin funciones)

| Regla | Efecto |
|---|---|
| `getDoc` por ID exacto (nunca `where`) | Nadie puede enumerar eventos; solo entra quien conoce el código |
| `firestore.rules` | Una foto solo se escribe si su evento padre existe y está `active:true` |
| `storage.rules` | Rutas forzadas `events/{code}/thumbs|full`, tipo `image/*` y tamaño máx. validado con `firestore.get()` cruzado |
| PIN de creación (`ADMIN-2024-CAMBIAME`) | Único filtro para crear eventos desde la app; **cámbialo** en `firestore.rules` |

El código validado se guarda en `sessionStorage` (muere al cerrar la pestaña) y el QR puede
llevar `?code=BODA-...` para entrar en un solo clic.

## 🌐 Despliegue

```bash
npm run build
# Canal de preview (no toca producción):
firebase hosting:channel:deploy prueba-boda --expires 2h
# Producción:
firebase deploy --only hosting,firestore:rules,storage:rules
```

Detalles paso a paso en la sección **INSTRUCCIONES DE DESPLIEGUE** de la guía del repositorio.

## 🧪 Flujo de prueba rápida

1. Abre la app → *¿Organizador? Crear un evento nuevo* → código `BODA-ANA-Y-JUAN`, PIN configurado → obtén el QR.
2. Escanea el QR con el celular (misma red si usas `npm run dev`, o la URL de Hosting en producción).
3. Sube una foto desde galería y otra desde la cámara → verifica en consola el mensaje `[compresión] … → … KB`.
4. Toca una miniatura → modal en alta calidad → botón **Descargar**.

Hecho con ❤️ — sin registro, sin apps, sin servidores propios.

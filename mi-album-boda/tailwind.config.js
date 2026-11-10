// tailwind.config.js — Configuración de Tailwind CSS para mi-album-boda
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        boda: {
          50: '#faf6f1',
          100: '#f2e8dc',
          500: '#b08968',
          700: '#7f5539',
          900: '#432818',
        },
      },
    },
  },
  plugins: [],
};

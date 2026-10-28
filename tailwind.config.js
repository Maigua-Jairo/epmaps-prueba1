/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Guía de diseño EPMAPS (Skills/epmaps_design_system.md).
      colors: {
        epmaps: {
          dark: '#023373', // cabeceras, texto principal sobre fondo claro
          primary: '#0455BF', // botones primarios, foco, acentos
          secondary: '#0A6ABF', // botones secundarios, íconos, estado normal
          accent: '#22B7F2', // progreso, bordes de selección
          bg: '#F2F2F2', // fondo de las pantallas
        },
        // Estado operativo
        status: {
          online: '#10B981', // sincronizado
          offline: '#F59E0B', // sin señal / pendiente de envío (R9)
          danger: '#EF4444', // medidor dañado, consumo anómalo (R6), errores
        },
      },
    },
  },
  plugins: [],
};

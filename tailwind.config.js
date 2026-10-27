/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Con una fuente propia, fontWeight hace que Android engrose el texto de forma
  // artificial; cada peso usa su propio archivo de Manrope (ver plugin abajo).
  corePlugins: {
    fontWeight: false,
  },
  theme: {
    extend: {
      colors: {
        epmaps: {
          primary: '#0067B1',
          navy: '#0A2A4A',
          secondary: '#00A3E0',
          sky: '#E6F3FB',
          danger: '#D32F2F',
          warning: '#F9A825',
          success: '#2E7D32',
        },
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      // El orden importa: si coinciden dos pesos, gana el último (el más grueso).
      addUtilities({
        '.font-normal': { fontFamily: 'Manrope_400Regular' },
        '.font-medium': { fontFamily: 'Manrope_500Medium' },
        '.font-semibold': { fontFamily: 'Manrope_600SemiBold' },
        '.font-bold': { fontFamily: 'Manrope_700Bold' },
        '.font-extrabold': { fontFamily: 'Manrope_800ExtraBold' },
      });
    },
  ],
};

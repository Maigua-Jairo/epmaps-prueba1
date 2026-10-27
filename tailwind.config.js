/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        epmaps: {
          primary: '#0067B1',
          secondary: '#00A3E0',
          danger: '#D32F2F',
          warning: '#F9A825',
          success: '#2E7D32',
        },
      },
    },
  },
  plugins: [],
};

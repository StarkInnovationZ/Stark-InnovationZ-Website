/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
      },
      colors: {
        orange:  '#f97316',
        orange2: '#ea6c0a',
      },
    },
  },
  plugins: [],
};
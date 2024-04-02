/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#eee',
        sky: '#24a6af',
        lightsky: '#eeeef2',
        blue: '#17202e',
        lightblue: '#f5f6fa',
        gray: '#6b758e',
        black: '#111',
      },
      spacing: {
        '3/4': '75%',
      },
    },
  },
  plugins: [],
};

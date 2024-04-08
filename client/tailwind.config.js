/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#eeeb',
        sky: '#24a6af',
        lightsky: '#35bac3',
        blue: '#17202e',
        lightblue: '#1e2c43',
        gray: '#6b758e',
        dim: '#334155',
        black: '#111',
      },
      spacing: {
        '3/4': '75%',
      },
    },
  },
  plugins: [],
};

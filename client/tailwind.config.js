/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bermuda: {
          light: '#eeeeee',
          dark: '#333333',
          disabled: '#555555',
          hover: '#dddddd',
          border: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};

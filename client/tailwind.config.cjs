/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          600: '#2e2e2e',
          700: '#1f1f1f',
          800: '#161616',
          900: '#0f0f0f',
        },
      },
    },
  },
  plugins: [],
};

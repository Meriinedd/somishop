/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#F9F7F2',
        'warm-card': '#FFFFFF',
        'sage-green': '#8F9779',
        'sage-dark': '#6B705C',
        'earth-brown': '#5C5042',
        'soft-gold': '#D4C5A9',
      },
      fontFamily: {
        serif: ['"Noto Serif Thai"', 'serif'],
        sans: ['"Prompt"', 'sans-serif'],
        body: ['"Sarabun"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
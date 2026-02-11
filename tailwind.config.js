/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#10B981", // Emerald 500
        secondary: "#1F2937", // Gray 800
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

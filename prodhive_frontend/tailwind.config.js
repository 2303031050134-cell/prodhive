/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Plane-like color tokens (aliasing to standard zinc for now)
        'plane-bg': {
          light: '#ffffff',
          dark: '#0e0f11'
        },
        'plane-border': {
          light: '#e5e7eb',
          dark: '#1e1f21'
        }
      }
    },
  },
  plugins: [],
}

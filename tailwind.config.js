/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          light: '#fff5d7',    // Ragin Beige
          DEFAULT: '#feb300',  // Sleuthe Yellow
          shadow: '#ffaaab',   // Pink Leaf
        },
        night: {
          light: '#ff5e6c',    // Coral Pink
          DEFAULT: '#ff5e6c',  // Coral Pink
          shadow: '#451116',   // Pink Shadow
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

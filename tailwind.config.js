/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telmed: {
          wine: '#6E1A37',      // Primary Deep Wine / Maroon
          berry: '#AE2448',     // Crimson / Rich Berry Red (Emergency / Spikes)
          teal: '#72BAA9',      // Teal / Sage (Normal / Safe / Stream)
          lime: '#D5E7B5',      // Soft Mint / Lime (Baseline bands / Pills)
          gray: '#ECECEC',      // Background / Neutral Gray
          darkwine: '#4a1124',
          lightwine: '#8b2447',
          deepberry: '#8a1835',
          lightteal: '#8acbbe',
          darkteal: '#4d8a7c',
          darklime: '#b8d38c',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(110, 26, 55, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -5px rgba(110, 26, 55, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

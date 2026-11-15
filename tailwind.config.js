/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1719D9",        // Royal Blue
          green: "#C6FD04",       // Lime Green
          yellow: "#FFD21A",      // Sunshine Yellow
          charcoal: "#242424",    // Charcoal Text
          muted: "#747474",       // Muted Gray Text
          border: "#EEEEEE",      // Light Gray Border
          white: "#FFFFFF",       // Pure White
          paper: "#FAFAF9",       // Subtle Off-White for contrast panels
        }
      },
      fontFamily: {
        headline: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'Gautami', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'Mangal', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'editorial': '0 4px 20px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}

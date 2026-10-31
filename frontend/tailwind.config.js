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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#ff782d', // Mockup orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        navy: {
          800: '#102a3c',
          900: '#0b1f2e', // Mockup hero & footer background
          950: '#071520',
        },
        brandOrange: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#ff782d',
          600: '#ea580c',
          700: '#c2410c',
        },
        brandTeal: {
          50: '#eef8fa',
          100: '#e0f4f9', // Mockup sanitary card background
          500: '#14b8a6',
          600: '#0d9488',
        },
        peach: {
          50: '#fff9f5',
          100: '#fff3e8', // Mockup paints card background
          200: '#fed7aa',
        },
        btnNavy: '#0c2333',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

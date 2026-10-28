/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Verde oscuro principal (barra lateral, botones primarios)
        brand: {
          50: '#eef7f1', 100: '#d6ecdd', 200: '#aed8bd', 300: '#7dbd96', 400: '#4f9e70',
          500: '#2f8253', 600: '#1f6a42', 700: '#175536', 800: '#12432c', 900: '#0f3d2e', 950: '#08241b',
        },
        // Estados de clasificación
        healthy: { DEFAULT: '#1f8a4c', soft: '#e3f4ea' },
        warn: { DEFAULT: '#d97706', soft: '#fdf0dc' },
        danger: { DEFAULT: '#dc2626', soft: '#fde5e5' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 40, 30, 0.04), 0 4px 16px rgba(16, 40, 30, 0.06)',
      },
      borderRadius: { xl2: '1.125rem' },
      keyframes: {
        progress: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(300%)' } },
      },
    },
  },
  plugins: [],
};

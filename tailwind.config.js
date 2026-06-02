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
        // High contrast brand colors for WCAG 2.2 AA alignment in both modes
        // These can also be driven dynamically by CSS variables in index.css
        brand: {
          lightBg: '#F7F9FC',
          darkBg: '#0F172A',
          lightCard: '#FFFFFF',
          darkCard: '#1E293B',
          lightText: '#17212B',
          darkText: '#F8FAFC',
          lightTextSec: '#5F6B7A',
          darkTextSec: '#CBD5E1',
          
          primary: '#4F46E5', // Claro
          primaryDark: '#818CF8', // Oscuro
          
          secondary: '#06B6D4', // Claro
          secondaryDark: '#22D3EE', // Oscuro
          
          success: '#22C55E', // Claro
          successDark: '#4ADE80', // Oscuro
          
          energy: '#F97316', // Claro
          energyDark: '#FB923C', // Oscuro
          
          warning: '#FACC15',
          error: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'game-flat': '0 4px 0 0 var(--shadow-color)',
        'game-flat-hover': '0 6px 0 0 var(--shadow-color)',
        'game-flat-active': '0 1px 0 0 var(--shadow-color)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

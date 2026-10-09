/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand / surface
        ink: {
          950: '#06070C',
          900: '#0B0D17',
          850: '#111325',
          800: '#151830',
          700: '#1D2142',
          600: '#282C5C',
          500: '#3A3E7A',
        },
        paper: {
          50: '#F7F7FB',
          100: '#F1F1FA',
          200: '#E7E7F3',
          300: '#D7D7E8',
          400: '#B8B8CE',
          500: '#8A8AA3',
          600: '#5E5E78',
          700: '#3F3F55',
          800: '#2A2A3B',
          900: '#171723',
        },
        accents: {
          violet: {
            300: '#C9B8FF',
            400: '#A78BFF',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
          },
          indigo: {
            300: '#B3BAFF',
            400: '#8E9AFF',
            500: '#6366F1',
            600: '#4F46E5',
          },
        },
      },
      fontFeatureSettings: {
        css: 'css',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(6,7,12,0.04), 0 8px 24px -12px rgba(6,7,12,0.10)',
        'card-hover': '0 1px 2px 0 rgba(6,7,12,0.06), 0 18px 40px -16px rgba(6,7,12,0.18)',
        pop: '0 12px 40px -12px rgba(11,13,23,0.35), 0 2px 6px -1px rgba(11,13,23,0.20)',
      },
      borderRadius: {
        xl2: '0.95rem',
        '2xl2': '1.15rem',
      },
      typography: {},
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'scale-in': 'scale-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        sand: {
          50: '#fdfcf7',
          100: '#faf6e9',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -4px rgba(6, 78, 59, 0.08), 0 8px 24px -12px rgba(6, 78, 59, 0.10)',
        card: '0 1px 2px rgba(6, 78, 59, 0.04), 0 8px 32px -12px rgba(6, 78, 59, 0.10)',
        glow: '0 0 0 4px rgba(16, 185, 129, 0.18)',
        gold: '0 8px 28px -10px rgba(217, 119, 6, 0.45)',
      },
      backgroundImage: {
        'mesh-emerald':
          'radial-gradient(at 20% 0%, rgba(16,185,129,0.18) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(251,191,36,0.12) 0, transparent 45%), radial-gradient(at 80% 100%, rgba(6,95,70,0.12) 0, transparent 50%)',
        'gradient-hero':
          'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)',
        'gradient-gold':
          'linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        shimmer: 'shimmer 2.4s linear infinite',
        sway: 'sway 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

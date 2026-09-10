/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#292524',
          active: '#0c0a09',
        },
        ink: '#0c0a09',
        body: {
          DEFAULT: '#4e4e4e',
          strong: '#292524',
        },
        muted: {
          DEFAULT: '#777169',
          soft: '#a8a29e',
        },
        hairline: {
          DEFAULT: '#e7e5e4',
          soft: '#f0efed',
          strong: '#d6d3d1',
        },
        canvas: {
          DEFAULT: '#f5f5f5',
          soft: '#fafafa',
          deep: '#0c0a09',
        },
        surface: {
          card: '#ffffff',
          strong: '#f0efed',
          dark: '#0c0a09',
          'dark-elevated': '#1c1917',
        },
        'on-primary': '#ffffff',
        'on-dark': '#ffffff',
        'on-dark-soft': '#a8a29e',
        gradient: {
          mint: '#a7e5d3',
          peach: '#f4c5a8',
          lavender: '#c8b8e0',
          sky: '#a8c8e8',
          rose: '#e8b8c4',
        },
        semantic: {
          success: '#16a34a',
          error: '#dc2626',
        },
      },
      fontFamily: {
        display: ['"EB Garamond"', 'Waldenburg', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.03)',
        soft: '0 4px 16px rgba(0, 0, 0, 0.04)',
        'card-elevated': '0 8px 30px rgba(0, 0, 0, 0.06)',
        popover: '0 12px 36px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        orbDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.08)' },
          '100%': { transform: 'translate(-20px, 25px) scale(0.95)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'orb-drift': 'orbDrift 20s infinite alternate ease-in-out',
        'fade-in': 'fadeIn 0.18s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};

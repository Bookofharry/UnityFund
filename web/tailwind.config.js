/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy brand scale (app uses this)
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Landing page design system
        navy: {
          50:  '#eef1fb',
          100: '#cdd3f0',
          200: '#9baae1',
          300: '#6881d2',
          400: '#3558c3',
          500: '#1a2b6e',
          600: '#152358',
          700: '#101b43',
          800: '#0c1232',
          900: '#070b1f',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#faeecd',
          200: '#f3dc9b',
          300: '#eac564',
          400: '#dfaa3c',
          500: '#c8912a',
          600: '#a97620',
          700: '#8a5d1c',
          800: '#6f4a1c',
          900: '#5c3d1b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem,5vw,4rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-l':  ['clamp(2rem,4vw,3rem)',   { lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-m':  ['clamp(1.5rem,3vw,2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(12,18,50,0.06), 0 4px 16px rgba(12,18,50,0.04)',
        'card-hover': '0 4px 24px rgba(12,18,50,0.10)',
        'elevated': '0 12px 40px rgba(12,18,50,0.12)',
        'navy': '0 20px 60px rgba(26,43,110,0.22)',
        'navy-sm': '0 8px 32px rgba(26,43,110,0.14)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(79,70,229,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(26,43,110,0.06) 0%, transparent 60%)',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.04'%3E%3Cpath d='M40 40H0V0h40v40zm-1-1V1H1v38h38z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 90s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D1B2A',
        surface: '#1B2A3B',
        accent: '#00C896',
        'accent-hover': '#00A87E',
        text: '#F0F4F8',
        muted: '#7A8FA6',
        danger: '#E63946',
        warning: '#F4A261',
        ok: '#4CAF50',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

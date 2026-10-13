/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          DEFAULT: '#121215',
          subtle: '#18181b',
          border: '#27272a',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glass: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 30px -4px rgba(0, 0, 0, 0.5)',
        glow: '0 0 40px -10px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: 'var(--text)',
        muted: 'var(--muted)',
        'muted-2': 'var(--muted-2)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        line: 'var(--border)',
        acid: 'var(--acid)',
        mint: 'var(--mint)',
        amber: 'var(--amber)',
        coral: 'var(--coral)',
        violet: 'var(--violet)',
        sky: 'var(--sky)',
        pink: 'var(--pink)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
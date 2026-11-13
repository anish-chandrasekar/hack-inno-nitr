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
        sb: {
          bg: 'var(--sb-bg)',
          sidebar: 'var(--sb-sidebar)',
          card: 'var(--sb-card)',
          elevated: 'var(--sb-elevated)',
          primary: 'var(--sb-primary)',
          secondary: 'var(--sb-secondary)',
          success: 'var(--sb-success)',
          warning: 'var(--sb-warning)',
          critical: 'var(--sb-critical)',
          text: 'var(--sb-text)',
          'text-secondary': 'var(--sb-text-secondary)',
          border: 'var(--sb-border)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

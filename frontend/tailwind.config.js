/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sb: {
          bg: '#0B1220',
          sidebar: '#0F172A',
          card: '#111C30',
          elevated: '#17243A',
          primary: '#38BDF8',
          secondary: '#6366F1',
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          text: '#F8FAFC',
          'text-secondary': '#94A3B8',
          border: '#243249',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

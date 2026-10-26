/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8EF',
        espresso: '#321B16',
        cocoa: '#59382D',
        bronze: '#B98451',
        gold: '#C8A15A',
        green: {
          success: '#26734D',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(50, 27, 22, 0.06), 0 1px 2px 0 rgba(50, 27, 22, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(50, 27, 22, 0.14), 0 4px 8px -2px rgba(50, 27, 22, 0.08)',
        'sheet': '0 10px 30px rgba(50, 27, 22, 0.16)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
}

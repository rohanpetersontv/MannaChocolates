/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        choco: {
          950: '#1A0000',
          900: '#2E0E00',
          800: '#4A1A08',
          700: '#6B2D0F',
          600: '#7D3011',
          500: '#8B3A14',
        },
        brown: {
          dark:  '#4A1A08',
          mid:   '#6B2D0F',
          warm:  '#8B4513',
          light: '#C4834A',
        },
        cream:     '#FFF8F0',
        parchment: '#F5EDE0',
        linen:     '#EFE0CC',
        offwhite:  '#F9F5F0',
        espresso:  '#2E0E00',
        cocoa:     '#6B2D0F',
        bronze:    '#C4834A',
        gold: {
          DEFAULT: '#C8A15A',
          light:   '#E2C07A',
          dark:    '#9E6938',
          pale:    '#F5D78E',
        },
        green: { success: '#26734D' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 4px 24px 0 rgba(74,26,8,0.08)',
        'card-hover': '0 16px 48px 0 rgba(74,26,8,0.16)',
        'btn':        '0 4px 16px rgba(107,45,15,0.35)',
        'btn-hover':  '0 8px 28px rgba(107,45,15,0.5)',
        'sheet':      '0 10px 40px rgba(46,14,0,0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

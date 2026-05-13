import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a64',
          50: '#f1f4f9',
          100: '#dde5f0',
          200: '#bcc9e0',
          300: '#94a8cc',
          400: '#6985b5',
          500: '#4d699d',
          600: '#3c5481',
          700: '#314569',
          800: '#293a57',
          900: '#1e3a64',
          950: '#13243f',
        },
        orange: {
          DEFAULT: '#e8852a',
          50: '#fdf6ee',
          100: '#fae8d2',
          200: '#f4cea0',
          300: '#eeae62',
          400: '#ea9442',
          500: '#e8852a',
          600: '#cf6a1b',
          700: '#aa5118',
          800: '#88421b',
          900: '#6f381a',
          950: '#3c1c0a',
        },
        cream: {
          DEFAULT: '#fbf8f3',
          50: '#fdfcf9',
          100: '#fbf8f3',
          200: '#f5ead9',
          300: '#ecd9b8',
          400: '#dbb887',
          500: '#cb9d61',
          600: '#b88248',
          700: '#9a673c',
          800: '#7e5335',
          900: '#67452f',
        },
      },
      fontFamily: {
        sans: [
          '"Google Sans"',
          '"Noto Sans Armenian"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          '"Google Sans"',
          '"Noto Sans Armenian Display"',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        prose: '70ch',
      },
    },
  },
  plugins: [],
};

export default config;

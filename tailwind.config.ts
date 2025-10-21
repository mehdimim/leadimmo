import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './data/**/*.{js,ts,jsx,tsx,json}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          light: '#14b8a6',
          dark: '#0d4c45'
        },
        accent: '#f59e0b'
      },
      boxShadow: {
        soft: '0 20px 40px -24px rgba(15, 118, 110, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;

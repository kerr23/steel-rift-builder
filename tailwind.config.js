/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        success: 'var(--success-color)',
        danger: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--info-color)',
        black: 'var(--black-color)',
        'bg': 'var(--bg-color)',
        'card-bg': 'var(--card-bg-color)',
        'text': 'var(--text-color)',
        'text-muted': 'var(--text-muted-color)',
        border: 'var(--border-color)',
        'input-bg': 'var(--input-bg-color)',
        'input-border': 'var(--input-border-color)',
        'medium-grey': 'var(--medium-grey)',
        'light-grey': 'var(--light-grey)',
        'dark-grey': 'var(--dark-grey)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
    },
  },
  plugins: [],
}


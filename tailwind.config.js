/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        'surface-container': '#201f1f',
        'surface-container-low': '#1d1c1c',
        'surface-container-lowest': '#191818',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'surface-variant': '#4a4640',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#d0c5af',
        primary: '#f2ca50',
        'primary-container': '#d4af37',
        'on-primary': '#131313',
        secondary: '#ea6b2a',
        'secondary-container': '#ea6b2a',
        'on-secondary': '#131313',
        error: '#fb7185',
        outline: '#938f99',
        'outline-variant': '#49454f',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        label: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

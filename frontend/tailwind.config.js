/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        huawei: {
          red: '#CF0A2C',
          dark: '#1A1A2E',
          darker: '#16213E',
          gray: '#0F3460',
          light: '#E94560'
        }
      }
    }
  },
  plugins: [],
}

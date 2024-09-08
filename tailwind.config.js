/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./primevue-presets/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    
    extend: {
      colors: {
        primary: 'black',
        secondary: 'black',
        neutral: 'black',
        accent: 'black',
        surface: {
          400: 'black',
        },
      },
    },
    
    
    container:{
      center: true,
      padding: '1rem',
      screens: {
        sm: "640px",
        md: "500px",
        lg: "500px",
        xl: "500px",
        "2xl": "500px",
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-primeui')
  ],
}
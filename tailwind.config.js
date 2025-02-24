/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'dark',
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

      animation: {
        'text': 'text 5s ease infinite',
      },
      keyframes: {
        'text': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
      },

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


    container: {
      center: true,
      padding: '1rem',
      // screens: {
      //   sm: "640px",
      //   md: "640px",
      //   lg: "640px",
      //   xl: "640px",
      //   "2xl": "640px",
      // }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-primeui')
  ],
}
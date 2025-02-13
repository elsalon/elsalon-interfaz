/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode:  "class",
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
    
    // extend: {
    //   colors: {
    //     primary: 'black',
    //     secondary: 'black',
    //     neutral: 'black',
    //     accent: 'black',
    //     surface: {
    //       400: 'black',
    //     },
    //   },
    // },
    
    
    container:{
      center: true,
      // padding: '1rem',
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
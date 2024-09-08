/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {},
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
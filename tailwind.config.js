/** @type {import('tailwindcss').Config} */
module.exports = {
  daisyui: {
    themes: ["light", "dark", "cupcake"],
    darkTheme: "dark",
    theme: {
      extend: {
        fontSize: {
          'xxs': '0.625rem', // Adds a new 'xxs' size (10px)
          'nano': '0.5rem',  // Or any other name/size you want
        },
      },
    }
  },
}
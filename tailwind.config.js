/** @type {import('tailwindcss').Config} */

///Pastel pink (#F6C2CF), 
// lavender (#C9B7E9), 
// light blue (#CFE6FA),
// periwinkle (#DCC7F2), 
// soft background (#F5F6FA)

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.625rem', // Adds a new 'xxs' size (10px)
        'nano': '0.5rem',  // Or any other name/size you want
      },
    },
  },
  plugins: [],
  //this is old way of theme setup using daisyui, this is moved to index.css in newer version 
  daisyui: {
    themes: [
      "light",
      {
        dark: {
          // "primary": "#dcadb3", // Lighter pink for better visibility in dark mode
          // "primary-focus": "#c99ba1",
          // "primary-content": "#1d232a",
          // "secondary": "#7c3aed",
          // "secondary-focus": "#6d28d9",
          // "secondary-content": "#ffffff",
          // "accent": "#1fb2a6",
          // "accent-focus": "#0d9488",
          // "accent-content": "#ffffff",
          // "neutral": "#2a2e37",
          // "neutral-focus": "#16181d",
          // "neutral-content": "#ffffff",
          // "base-100": "#1d232a",
          // "base-200": "#191e24",
          // "base-300": "#15191e",
          // "base-50": "#3b82f6",
          // "base-content": "#a6adbb",
          // "info": "#3abff8",
          // "success": "#36d399",
          // "warning": "#fbbd23",
          // "error": "#f87272",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    safelist: [
    'bg-base-100', 'bg-base-200', 'bg-base-300', 'bg-blue', 'bg-orange', 'bg-accent',
    'from-base-100/10', 'from-accent/10', 'from-error/10', 'from-success/10', 'from-blue/10',
    'from-warning/10', 'from-secondary/10', 'from-orange/10', 'from-header-teal/10',
    'bg-base-100/10', 'bg-accent/10', 'bg-error/10', 'bg-success/10', 'bg-blue/10', 'bg-warning/10',
    'bg-secondary/10', 'bg-orange/10', 'bg-header-teal/10'
  ],
  },
}
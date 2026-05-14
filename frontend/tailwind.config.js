/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#18381a",
        "primary-container": "#2f4f2f",
        "on-primary": "#ffffff",
        "secondary": "#486638",
        "surface": "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "on-surface": "#151c27",
        "on-surface-variant": "#424840",
        "outline": "#737970",
        "outline-variant": "#c2c8be",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
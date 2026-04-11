/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2A44",
        stone: "#F7FBFF",
        clay: "#A7C6ED",
        sage: "#8BC3E6",
        sand: "#BFE5F0",
        primary: "#A7C6ED",
        accent: "#8BC3E6",
        powder: "#BFE5F0",
      },
      boxShadow: {
        soft: "0 12px 28px -16px rgba(53, 89, 136, 0.34)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

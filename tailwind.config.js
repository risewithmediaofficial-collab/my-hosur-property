/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F454D",
        stone: "#EAF7F5",
        clay: "#D4E8E4",
        sage: "#63C1BB",
        sand: "#F3FBFA",
        primary: "#105F68",
        accent: "#3A9295",
        powder: "#DEF1EF",
        // Enhanced accessible grays
        text: {
          primary: "#0F454D",
          secondary: "#4F7074",
          tertiary: "#7DA4A6",
          light: "#B4D0D0",
        },
      },
      fontSize: {
        // Enhanced typography scale with better mobile support
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.03em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.04em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.04em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
      },
      boxShadow: {
        soft: "0 18px 38px -24px rgba(16, 95, 104, 0.22)",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui"],
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};

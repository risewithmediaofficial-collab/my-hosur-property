/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E3A8A",
        stone: "#F7FBFF",
        clay: "#A7C6ED",
        sage: "#8BC3E6",
        sand: "#BFE5F0",
        primary: "#A7C6ED",
        accent: "#8BC3E6",
        powder: "#BFE5F0",
        // Enhanced accessible grays
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          tertiary: "#64748b",
          light: "#cbd5e1",
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
        soft: "0 12px 28px -16px rgba(53, 89, 136, 0.34)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
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

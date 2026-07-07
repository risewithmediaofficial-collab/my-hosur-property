/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#274F9A",
          dark: "#1B366B",
          light: "#3D6CB9",
        },
        orange: {
          DEFAULT: "#FF9914",
          500: "#FF9914",
          600: "#FF9914",
          hover: "#E0850D",
          light: "#fff4e3",
        },
        surface: "#ffffff",
        ink: "#274F9A",
        stone: "#ffffff",
        clay: "#e8edf2",
        sage: "#FF9914",
        sand: "#ffffff",
        primary: "#274F9A",
        accent: "#FF9914",
        powder: "#fff4e3",
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          tertiary: "#64748b",
          light: "#e2e8f0",
        },
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.005em" }],
        base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0em" }],
        lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "0em" }],
        xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.02em" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.03em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.04em" }],
        "5xl": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.04em" }],
        "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.05em" }],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(39, 79, 154, 0.08)",
        card: "0 4px 20px rgba(39, 79, 154, 0.1)",
        search: "0 12px 40px rgba(39, 79, 154, 0.15)",
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        heading: ["Philosopher", "sans-serif"],
        philosopher: ["Philosopher", "sans-serif"],
      },
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};

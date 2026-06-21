/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f8fa",
          100: "#edf0f3",
          200: "#d8dde4",
          500: "#667085",
          700: "#344054",
          900: "#111827",
          950: "#090d14"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "ui-monospace", "monospace"]
      },
      boxShadow: {
        focus: "0 0 0 3px rgb(14 165 233 / 0.25)"
      }
    }
  },
  plugins: []
};

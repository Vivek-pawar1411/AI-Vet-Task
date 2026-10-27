/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d3329",
        muted: "#758178",
        leaf: "#47765c",
        mint: "#eaf2eb",
        canvas: "#f5f7f4",
        line: "#e7ebe6",
      },
      boxShadow: { card: "0 8px 30px rgba(38, 58, 45, 0.045)" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

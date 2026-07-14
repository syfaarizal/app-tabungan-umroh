/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          900: "#14532D",
        },
        ink: "#1F2937",
        muted: "#6B7280",
        surface: "#FFFFFF",
        background: "#F7FAF8",
        danger: "#DC2626",
        warning: "#D97706",
      },
      borderRadius: {
        card: "20px",
        button: "16px",
      },
    },
  },
  plugins: [],
};

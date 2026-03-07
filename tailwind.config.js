/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C47FF",
        secondary: "#F97316",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        "text-primary": "#1A1A2E",
        "text-secondary": "#6B7280",
      },
    },
  },
  plugins: [],
};

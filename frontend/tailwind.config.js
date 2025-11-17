/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0 0% 20%)",
        background: "hsl(240 10% 3.9%)",
        foreground: "hsl(0 0% 98%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      maxWidth: {
        content: "720px",
      },
    },
  },
  plugins: [],
};

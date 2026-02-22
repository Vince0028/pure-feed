/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(240 5.9% 90%)",
        input: "hsl(240 5.9% 90%)",
        ring: "hsl(240 10% 3.9%)",
        background: "hsl(240, 10%, 4%)", // very dark blue/black
        foreground: "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(240 5.9% 10%)",
          foreground: "hsl(0 0% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 5.9% 10%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(0 0% 98%)",
        },
        muted: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 3.8% 46.1%)",
        },
        accent: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 5.9% 10%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(240 10% 3.9%)",
        },
        "badge-tech": "hsl(180, 100%, 30%)",
        "badge-video": "hsl(0, 100%, 65%)",
        "badge-article": "hsl(220, 100%, 70%)",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    }
  },
  plugins: [],
}


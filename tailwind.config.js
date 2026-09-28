/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 214 32% 91%))",
        input: "hsl(var(--input, 214 32% 91%))",
        ring: "hsl(var(--ring, 224 76% 32%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222 47% 11%))",
        primary: {
          DEFAULT: "#1E3A8A",
          hover: "#1E40AF",
          foreground: "hsl(var(--primary-foreground, 210 40% 98%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 210 40% 96%))",
          foreground: "hsl(var(--secondary-foreground, 222 47% 11%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84% 60%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 210 40% 96%))",
          foreground: "hsl(var(--muted-foreground, 215 16% 47%))",
        },
        accent: {
          DEFAULT: "#2563EB",
          foreground: "hsl(var(--accent-foreground, 222 47% 11%))",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}

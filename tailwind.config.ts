import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        surface: "#f6f1e8",
        sand: "#e8dcc8",
        ember: "#c9724f",
        pine: "#4f7a6a",
        mist: "#d9e7df",
        line: "#d8cdbb",
        primary: "#264653",
        "primary-foreground": "#f8f5ef",
        muted: "#ede3d3",
        "muted-foreground": "#6b7280",
        danger: "#c75b5b",
        border: "#d8cdbb"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(16, 20, 24, 0.08)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

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
        ink: "#111827",
        surface: "#eef4ff",
        sand: "#dce6f6",
        ember: "#ef7d57",
        pine: "#1f6f78",
        mist: "#d8efe9",
        line: "#bfd0e4",
        primary: "#111827",
        "primary-foreground": "#eef4ff",
        muted: "#dce6f6",
        "muted-foreground": "#5b6b84",
        danger: "#dc5f5f",
        border: "#bfd0e4"
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

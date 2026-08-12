import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        page: "var(--color-page)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        destructive: "var(--color-destructive)",
        warning: "var(--color-warning)",
        "warning-bg": "var(--color-warning-bg)",
        "sidebar-bg": "var(--color-sidebar-bg)",
        "sidebar-fg": "var(--color-sidebar-fg)",
        "sidebar-fg-muted": "var(--color-sidebar-fg-muted)",
        "sidebar-active": "var(--color-sidebar-active)",
        "sidebar-active-soft": "var(--color-sidebar-active-soft)",
        "sidebar-hairline": "var(--color-sidebar-hairline)",
        "sidebar-chip": "var(--color-sidebar-chip)",
      },
      fontFamily: {
        heading: ["Figtree", "sans-serif"],
        sans: ["Noto Sans", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

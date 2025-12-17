import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                border: "var(--border)",
                card: "var(--card)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
                muted: "var(--muted)",
                "muted-foreground": "var(--muted-foreground)",
            },
        },
    },
    plugins: [],
};
export default config;

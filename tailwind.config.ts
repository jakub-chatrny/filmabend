import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                primary: {
                    dark: "#CC3F00",
                    DEFAULT: "#FF4F00",
                    light: "#FF7233",
                    lighter: "#FF9666",
                    lightest: "#FFDCCC",
                    pale: "#FFF6F6",
                    25: "#FF4F003F",
                    50: "#FF4F007F",
                },
                gray: {
                    15: "#252528",
                    40: "#62626A",
                },
                black: {
                    DEFAULT: "#0C0C0D",
                },
                dropShadow: {
                    DEFAULT: "0px 0px 20px rgba(0, 0, 0, 0.25)",
                },
            },
        },
    },
    plugins: [],
};
export default config;

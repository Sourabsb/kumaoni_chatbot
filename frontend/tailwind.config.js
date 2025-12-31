/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "transparent",
                surface: "rgba(255, 255, 255, 0.05)",
                "surface-highlight": "rgba(255, 255, 255, 0.1)",
                border: "rgba(255, 255, 255, 0.1)",
                text: "#ffffff",
                "text-secondary": "rgba(255, 255, 255, 0.6)",
                primary: "#ffffff",
                "primary-dark": "rgba(255, 255, 255, 0.9)",
                accent: "#60a5fa",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

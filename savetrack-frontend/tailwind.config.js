/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,tsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Requiere importar Inter en index.css o HTML
            },
        },
    },
    plugins: [],
}
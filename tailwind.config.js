/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/app/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Military-themed color palette
                olive: {
                    50: '#f7f8f5',
                    100: '#eaefd4',
                    200: '#d5dcb0',
                    300: '#b8c282',
                    400: '#9ba85e',
                    500: '#798345',
                    600: '#5c6534',
                    700: '#454d28',
                    800: '#2e331b',
                    900: '#171a0d',
                    950: '#0b0d07',
                },
                military: {
                    100: '#efefef',
                    200: '#d4d6d0',
                    300: '#b5b9b1',
                    400: '#8a9085',
                    500: '#707769',
                    600: '#4d5244',
                    700: '#373c32',
                    800: '#272a23',
                    900: '#1a1c18',
                    950: '#0d0e0c',
                },
                camo: {
                    100: '#e8e6de',
                    200: '#c8c5b1',
                    300: '#a9a688',
                    400: '#8c8766',
                    500: '#665f42',
                    600: '#4d4932',
                    700: '#373327',
                    800: '#201e18',
                    900: '#100f0c',
                    950: '#080805',
                },
                tan: {
                    100: '#f7eedd',
                    200: '#efe0c3',
                    300: '#e7d1a9',
                    400: '#dfc38f',
                    500: '#d4af6c',
                    600: '#ac8d57',
                    700: '#816a41',
                    800: '#56472c',
                    900: '#2b2316',
                    950: '#16110b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                // Larger text for VR readability
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '4rem',
            },
            spacing: {
                // Larger touch targets for VR
                '12': '3rem',
                '16': '4rem',
                '20': '5rem',
                '24': '6rem',
            },
            borderRadius: {
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            minHeight: {
                '12': '3rem',
                '16': '4rem',
            },
            minWidth: {
                '12': '3rem',
                '16': '4rem',
                '48': '12rem',
            },
            maxWidth: {
                '7xl': '80rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
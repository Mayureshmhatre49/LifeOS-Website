import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                heading: ['Manrope', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                slate: {
                    950: '#020617',
                },
                teal: {
                    50:  '#f0fdfa',
                    100: '#ccfbf1',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                },
                emerald: {
                    400: '#34d399',
                    500: '#10b981',
                },
            },
            borderRadius: {
                '4xl': '2.5rem',
                '5xl': '3rem',
            },
            boxShadow: {
                'premium': '0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
                'premium-lg': '0 20px 48px -12px rgba(0,0,0,0.18)',
                'teal': '0 8px 24px -6px rgba(13,148,136,0.35)',
                'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                'card-hover': '0 8px 32px rgba(0,0,0,0.10)',
            },
            animation: {
                'fade-up': 'fadeUp 0.6s ease forwards',
                'fade-in': 'fadeIn 0.5s ease forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            maxWidth: {
                '8xl': '88rem',
            },
            screens: {
                '3xl': '1920px',
            },
        },
    },

    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
    ],
};

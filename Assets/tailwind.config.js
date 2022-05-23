const {colors} = require('tailwindcss/defaultTheme');
module.exports = {
    theme: {
        container: {
            center: true,
            padding: '1rem',
        },
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
            },
            textColor: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
            },
            boxShadow: {
                whitelight: '0 0px 25px -3px rgba(255, 255, 255, .1)'
            },
            borderWidth: {
                20: '20px',
                40: '40px',
                50: '50px'
            }
        },
    },
    variants: {
        borderColors: ["responsive", "hover", "focus", "group-hover"],
        visibility: ["responsive", "group-hover"],
    },
    plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('tailwindcss-plugins/pagination'),
    ],
    purge: [

    ],
}

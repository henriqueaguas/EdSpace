/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontWeight: {
				normal: 500
			},
			fontFamily: {
				sans: ['Gilmer'],
				serif: ['LinuxLibertine']
			},
			colors: {
				orange: '#E5AE3C',
				darkOrange: '#AD832D',
				dark: '#0D1117',
				darker: '#090f14',
				lighterBlack: '#060606',
				grey: '#0A261F',
				brown: '#321711'
			}
		}
	},
	daisyui: {
		styled: true,
		themes: false,
		base: false,
		utils: true,
		logs: false,
		rtl: false
	},
	plugins: [require('daisyui')]
};

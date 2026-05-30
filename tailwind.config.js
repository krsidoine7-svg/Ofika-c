/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			fontSize: {
				'title-2xl': ['72px', '90px'],
				'title-xl': ['60px', '72px'],
				'title-lg': ['48px', '60px'],
				'title-md': ['36px', '44px'],
				'title-sm': ['30px', '38px'],
				'theme-xl': ['20px', '30px'],
				'theme-sm': ['14px', '20px'],
				'theme-xs': ['12px', '18px'],
			},
			fontFamily: {
				inter: [
					'var(--font-inter)',
					'Inter',
					'sans-serif'
				]
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Palette Orange étendue (Premium)
				orange: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#f97316', // Brand primary (ofika-orange)
					600: '#ea580c',
					700: '#c2410c',
					800: '#9a3412',
					900: '#7c2d12',
				},
				// TailAdmin Colors
				brand: {
					25: '#f2f7ff',
					50: '#ecf3ff',
					100: '#dde9ff',
					200: '#c2d6ff',
					300: '#9cb9ff',
					400: '#7592ff',
					500: '#465fff', // Primary brand color
					600: '#3641f5',
					700: '#2a31d8',
					800: '#252dae',
					900: '#262e89',
					950: '#161950',
				},
				'blue-light': {
					25: '#f5fbff',
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#b9e6fe',
					300: '#7cd4fd',
					400: '#36bffa',
					500: '#0ba5ec',
					600: '#0086c9',
					700: '#026aa2',
					800: '#065986',
					900: '#0b4a6f',
					950: '#062c41',
				},
				// Success, Error, Warning redefined for TailAdmin compatibility if needed
				'success-tail': {
					50: '#ecfdf3',
					500: '#12b76a',
				},
				'error-tail': {
					50: '#fef3f2',
					500: '#f04438',
				},
				'warning-tail': {
					50: '#fffaeb',
					500: '#f79009',
				},
				// Palette Purple étendue (Accent)
				purple: {
					50: '#faf5ff',
					100: '#f3e8ff',
					200: '#e9d5ff',
					300: '#d8b4fe',
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea', // Accent principal
					700: '#7e22ce',
					800: '#6b21a8',
					900: '#581c87',
				},
				// Couleurs legacy (compatibilité)
				'ofika-orange': '#f97316',
				'ofika-pink': '#ec4899',
				// Couleurs sémantiques
				success: '#10b981',
				warning: '#f59e0b',
				error: '#ef4444',
				info: '#3b82f6',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			boxShadow: {
				'theme-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
				'theme-lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
				'theme-sm': '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
				'theme-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
				'theme-xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
			},
			zIndex: {
				'99': '99',
				'999': '999',
				'9999': '9999',
				'99999': '99999',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate")
	],
}

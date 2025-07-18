
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				'space-navy': {
					DEFAULT: 'hsl(var(--space-navy))',
					light: 'hsl(var(--space-navy-light))',
				},
				earth: {
					green: 'hsl(var(--earth-green))',
					'green-light': 'hsl(var(--earth-green-light))',
					teal: 'hsl(var(--earth-teal))',
					'teal-light': 'hsl(var(--earth-teal-light))',
				},
				forest: {
					deep: 'hsl(var(--forest-deep))',
				},
				copper: {
					DEFAULT: 'hsl(var(--copper-accent))',
					light: 'hsl(var(--copper-light))',
				},
				gold: {
					warm: 'hsl(var(--gold-warm))',
					light: 'hsl(var(--gold-light))',
				},
				carbon: {
					positive: 'hsl(var(--carbon-positive))',
					negative: 'hsl(var(--carbon-negative))',
				},
				satellite: {
					blue: 'hsl(var(--primary))',
					glow: 'hsl(var(--primary-glow))',
				},
				glass: {
					bg: 'hsl(var(--glass-bg))',
					border: 'hsl(var(--glass-border))',
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-earth-premium': 'var(--gradient-earth-premium)',
				'gradient-copper': 'var(--gradient-copper)',
				'gradient-glass': 'var(--gradient-glass)',
			},
			boxShadow: {
				'premium': 'var(--shadow-premium)',
				'premium-lg': 'var(--shadow-premium-lg)',
				'copper': 'var(--shadow-copper)',
				'earth': 'var(--shadow-earth)',
				'glow': 'var(--glow-premium)',
			},
			fontFamily: {
				'premium-serif': ['Playfair Display', 'serif'],
				'premium-sans': ['Inter', 'sans-serif'],
				'premium-mono': ['Space Grotesk', 'monospace'],
				'inter': ['Inter', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
				'space': ['Space Grotesk', 'monospace'],
			},
			fontSize: {
				'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			transitionTimingFunction: {
				'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			},
			transitionDuration: {
				'400': '400ms',
				'600': '600ms',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'parallax': {
					'0%': { transform: 'translateY(0px)' },
					'100%': { transform: 'translateY(-50px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-right': 'slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
				'parallax': 'parallax 20s ease-in-out infinite alternate',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Use the CSS variable defined in layout.tsx
        sans: ['var(--font-manrope)', 'sans-serif'],
        // Keep mono font if needed
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        // Use CSS variables defined in globals.css
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'foreground-muted': 'hsl(var(--foreground-muted))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          dark: 'hsl(var(--accent-dark))',
          // foreground: 'hsl(var(--accent-foreground))' // Define if needed
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          muted: 'hsl(var(--border-muted))',
          default: 'hsl(var(--border-default))',
        },
        muted: {
          DEFAULT: 'hsl(var(--background-muted))', // Map background-muted
          // foreground: 'hsl(var(--muted-foreground))' // Define if needed
        }
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
        lg: 'var(--border-radius)', // Alias DEFAULT to lg if needed
        md: 'calc(var(--border-radius) - 2px)',
        sm: 'calc(var(--border-radius) - 4px)',
        xl: 'calc(var(--border-radius) + 4px)',
        full: '9999px',
        card: 'var(--border-radius-card)',
      },
    },
  },
  plugins: [],
}
export default config 
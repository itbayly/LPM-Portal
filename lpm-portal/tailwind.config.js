/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // "Strict 8px Hard Grid" & Spacing Tokens
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'], // Added for that "Terminal" feel
      },
      // Color Palette (VNDR "Tactile Instrument")
      colors: {
        canvas: '#F2F4F6', // Light: Frosted Platinum (was #F4F5F7)
        surface: '#FFFFFF', 
        border: '#E2E8F0', 
        
        // Brand Colors
        brand: {
          DEFAULT: '#2563EB', 
          light: '#3B82F6',   
          dark: '#1E40AF',
        },
        
        // Text Colors
        text: {
          primary: '#0F172A',   // Ink Navy (Sharper than Slate 900)
          secondary: '#64748B', // Slate 500
        },

        // Landing Page / Dark Mode Extensions
        'primary-light': '#0F172A',
        'primary-dark': '#F8FAFC',   
        'secondary-light': '#64748B', 
        'secondary-dark': '#94A3B8', 
        'accent': '#2563EB',         
      },
      backgroundImage: {
        // The Signature Gradient Borders
        'border-pearl': 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)',
        'border-neon': 'linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(112, 0, 255, 0.3) 100%)',
      },
      boxShadow: {
        'lvl1': '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)',
        'lvl2': '0px 4px 6px -1px rgba(0,0,0,0.1)',
        'lvl3': '0px 20px 25px -5px rgba(0,0,0,0.1)',
        
        // Glass Glows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
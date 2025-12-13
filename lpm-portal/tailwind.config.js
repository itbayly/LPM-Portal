/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- REQUIRED for the Landing Page dark mode toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // "Strict 8px Hard Grid" & Spacing Tokens
      spacing: {
        'xs': '4px',    // Space-XS
        'sm': '8px',    // Space-SM
        'md': '16px',   // Space-MD
        'lg': '24px',   // Space-LG
        'xl': '32px',   // Space-XL
        '2xl': '48px',  // Space-2XL
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Color Palette (Light Mode - Liquid Glass)
      colors: {
        canvas: '#F4F5F7', // Background
        surface: '#FFFFFF', // Surface (Cards)
        border: '#E2E8F0', // Slate 200
        brand: {
          DEFAULT: '#2563EB', // Royal Blue
          light: '#3B82F6',   // Warning Blue
          dark: '#1E40AF',
        },
        text: {
          primary: '#1E293B',   // Slate 900
          secondary: '#64748B', // Slate 500
        },
        status: {
          active: '#10B981',    // Green
          activeBg: '#D1FAE5',
          warning: '#3B82F6',   // Blue
          warningBg: '#DBEAFE',
          critical: '#EF4444',  // Red
          criticalBg: '#FEE2E2',
        },

        // --- LANDING PAGE EXTENSIONS ---
        // These map the landing page's custom class names to your theme
        'primary-light': '#1E293B',  // Same as text.primary
        'primary-dark': '#F8FAFC',   // Slate 50 (Whiteish)
        'secondary-light': '#64748B', // Same as text.secondary
        'secondary-dark': '#94A3B8',  // Slate 400
        'accent': '#2563EB',         // Same as brand.DEFAULT
      },
      borderRadius: {
        'sm': '6px',   // Buttons/Inputs
        'md': '12px',  // Cards/Containers
        'lg': '16px',  // Modals
      },
      // Depth System
      boxShadow: {
        'lvl1': '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)', // Cards
        'lvl2': '0px 4px 6px -1px rgba(0,0,0,0.1)', // Hover/Dropdowns
        'lvl3': '0px 20px 25px -5px rgba(0,0,0,0.1)', // Modals
        
        // Landing Page Shadows
        'glow': '0 0 20px rgba(37, 99, 235, 0.35)',      // Blue Glow
        'glow-dark': '0 0 25px rgba(37, 99, 235, 0.6)',  // Stronger Blue Glow
      }
    },
  },
  plugins: [],
}
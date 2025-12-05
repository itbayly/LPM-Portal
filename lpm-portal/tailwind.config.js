/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // "Strict 8px Hard Grid" & Spacing Tokens [cite: 108]
      spacing: {
        'xs': '4px',    // Space-XS
        'sm': '8px',    // Space-SM
        'md': '16px',   // Space-MD
        'lg': '24px',   // Space-LG
        'xl': '32px',   // Space-XL
        '2xl': '48px',  // Space-2XL
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // [cite: 123]
      },
      // Color Palette (Light Mode - Liquid Glass) [cite: 126]
      colors: {
        canvas: '#F4F5F7', // Background
        surface: '#FFFFFF', // Surface (Cards)
        border: '#E2E8F0', // Slate 200
        brand: {
          DEFAULT: '#2563EB', // Royal Blue [cite: 129]
          light: '#3B82F6',   // Warning Blue
          dark: '#1E40AF',
        },
        text: {
          primary: '#1E293B',   // Slate 900 [cite: 130]
          secondary: '#64748B', // Slate 500 [cite: 131]
        },
        status: {
          active: '#10B981',    // Green [cite: 134]
          activeBg: '#D1FAE5',
          warning: '#3B82F6',   // Blue [cite: 135]
          warningBg: '#DBEAFE',
          critical: '#EF4444',  // Red [cite: 136]
          criticalBg: '#FEE2E2',
        }
      },
      borderRadius: {
        'sm': '6px',   // Buttons/Inputs [cite: 140]
        'md': '12px',  // Cards/Containers [cite: 141]
        'lg': '16px',  // Modals [cite: 142]
      },
      // Depth System [cite: 143]
      boxShadow: {
        'lvl1': '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)', // Cards
        'lvl2': '0px 4px 6px -1px rgba(0,0,0,0.1)', // Hover/Dropdowns
        'lvl3': '0px 20px 25px -5px rgba(0,0,0,0.1)', // Modals
      }
    },
  },
  plugins: [],
}
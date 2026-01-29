/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          dark: "#0B0F19",
          void: "#0f172a",
        },
        neon: {
          cyan: "#06B6D4",
          magenta: "#D946EF",
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drift: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(100px) translateY(100px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', filter: 'blur(8px)' },
          '50%': { opacity: '1', filter: 'blur(12px)' },
        }
      }
    },
  },
  plugins: [],
}

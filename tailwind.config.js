/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        merchant: {
          primary: 'var(--merchant-primary, #4f46e5)',
          'primary-hover': 'var(--merchant-primary-hover, #4338ca)',
          'primary-light': 'var(--merchant-primary-light, #eef2ff)',
          'primary-foreground': 'var(--merchant-primary-foreground, #ffffff)',
          secondary: 'var(--merchant-secondary, #64748b)',
        },
        surface: 'var(--surface-color, #ffffff)',
        background: 'var(--bg-color, #f8fafc)',
        border: 'var(--border-color, #e2e8f0)',
        'text-main': 'var(--text-main, #0f172a)',
        'text-muted': 'var(--text-muted, #64748b)',
        success: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#ecfdf5',
          dark: '#065f46',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1ebe5d',
          dark: '#075e54',
          light: '#e8fdf0',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'elevated': '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

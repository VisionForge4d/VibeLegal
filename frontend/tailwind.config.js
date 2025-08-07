// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderColor: {
        border: 'var(--border)',
      },
      textColor: {
        foreground: 'var(--foreground)',
      },
      backgroundColor: {
        background: 'var(--background)',
      },
      outlineColor: {
        ring: 'var(--ring)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};

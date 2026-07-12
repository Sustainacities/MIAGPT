module.exports = {
  mode: 'jit',
  darkMode: false,
  theme: {
    container: { center: true, padding: '1.5rem' },
    extend: {
      colors: {
        holo: {
          cyan:    '#00f5ff',
          magenta: '#ff2d95',
          purple:  '#7b2fff',
          dark:    '#080818',
          panel:   'rgba(0,10,30,0.85)',
        }
      },
      animation: {
        'holo-flicker': 'holo-flicker 5s infinite',
        'ring-pulse':   'ring-pulse 2.4s infinite',
        'orbit-spin':   'orbit-spin 8s linear infinite',
        'beam-scan':    'beam-scan 1.2s linear infinite',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["synthwave"],
  },
  purge: ['./src/**/*.{js,md,njk,svg}'],
}

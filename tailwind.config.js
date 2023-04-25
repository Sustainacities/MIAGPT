module.exports = {
  mode: 'jit',
  darkMode: false,
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    debugScreens: {
      position: ['bottom', 'right'],
    },
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["lemonade", "synthwave", "pastel"],
  },
  purge: ['./src/**/*.{js,md,njk,svg}'],
}

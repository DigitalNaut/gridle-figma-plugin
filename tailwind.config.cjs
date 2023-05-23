/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/plugin/**/*.{js,ts,jsx,tsx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,html}",
  ],
  blocklist: ["eslint.config.js", "tailwind.config.cjs", "postcss.config.cjs"],
  theme: {
    extend: {},
  },
  plugins: [require("./plugins/tailwind.vendors.js")],
};

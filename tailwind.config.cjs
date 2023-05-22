/** @type {import('tailwindcss').Config} */
export default {
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

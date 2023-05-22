/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./plugin-src/**/*.{js,ts,jsx,tsx}",
    "./ui-src/**/*.{js,ts,jsx,tsx,html}",
  ],
  blocklist: ["eslint.config.js", "tailwind.config.js", "postcss.config.js"],
  theme: {
    extend: {},
  },
  plugins: [require("./plugins/tailwind.vendors.js")],
};

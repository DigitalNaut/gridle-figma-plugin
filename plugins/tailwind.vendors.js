const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addVariant, addComponents }) {
  addVariant("webkit-thumb", "&::-webkit-slider-thumb");
  addVariant("range-thumb", ["&::-moz-range-thumb", "&::-webkit-slider-thumb"]);

  addComponents({
    ".reset-range-thumb": {
      "-webkit-appearance": "none",
      "-webkit-tap-highlight-color": "transparent",
    },
  });
});

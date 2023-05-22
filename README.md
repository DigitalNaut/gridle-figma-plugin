# Gridle Plugin for Figma

## Description

This plugin allows you to create a grid pattern of squares and circles in Figma. It's great for pixelated art and background details.

## Installation

For now the only way to install this plugin is to clone this repository and run `yarn build` in the root directory. Then you can open Figma and go to `Plugins > Development > New Plugin...` and choose the `manifest.json` file in the `build` directory.

I'm working on getting this plugin into the Figma Community so it can be installed directly from Figma.

## Planned features

✅ Loading indicator and async (it current blocks the main thread, whoops!)

✅ Multiple range slider for element opacity

⏹ Saving, loading and default presets

🟨 Seeds for randomness generation

⏹ More shape options (triangles, hexagons, custom shapes, etc.)

🟨 UI options based on icon buttons rather than dropdowns

🟨 Option to use a color pattern instead of random color selection

🟨 Lock certain proportions (like when image editors lock aspect ratios) for horizontal and vertical element counts

Legend: ✅ Done, ⏹ In progress, 🟨 Planned

## For developers

All dependencies are installed locally with `pnpm install` and the project is built with `pnpm build`.
For development, you can use `pnpm dev` to watch for changes and rebuild automatically.

Use `pnpm lint` to run ESLint and `pnpm format` to run Prettier.

### Recommended tools

These tools are not required but they are recommended for development as they are already configured in this project:

- [Prettier](https://prettier.io/) for code formatting
- [ESLint](https://eslint.org/) for code linting
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [PNPM](https://pnpm.js.org/) for package management

## Disclaimers

This plugin is still in development and it may be safe for production use. Use at your own risk. It may contain bugs and other issues. Please report them if you find any. I'm aware of certain optimizations but I'm not sure if they're worth the effort.

This project is a fork of the [Official Figma ESBuild-React Plugin Template](https://github.com/figma/plugin-samples/tree/master/esbuild-react). The great majority of the code in this project was created by a human with the aid of LLMs including ChatGPT and Copilot.

This plugin is not affiliated with Figma in any way. It's just a personal project.
It's also my first Figma plugin, so please be gentle.

## License

This project is under a MODIFIED [Creative Commons Zero v1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) license. See the [LICENSE](LICENSE) file for more details.

Basically, don't make money off the code itself as this is a project for the community, but please do use it to create cool designs for any purpose.
If you have better ideas for a license, please let me know. I'm not a lawyer and I'm not sure if this license is the best for this project.
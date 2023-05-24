# Gridle Plugin for Figma

## Description

This plugin allows you to create a grid pattern of squares and circles in Figma. It's great for pixelated art and background details.

## Features

- Generate a grid of shapes supported by Figma with a single click. This includes squares, circles, polygons and stars.
- Fine control of the size of the grid and the number of the elements per axis.
- Vary the properties of each element including its color based on a color palette, its opacity, and corner radius.
- Create gradients by modulating the opacity of the elements based on their position.

## Installation

For now the only way to install this plugin is to clone this repository and run `yarn build` in the root directory. Then you can open Figma and go to `Plugins > Development > New Plugin...` and choose the `manifest.json` file in the `build` directory.

I'm working on getting this plugin into the Figma Community so it can be installed directly from Figma.

## Planned features

🟦 Saving and loading current settings

🟦 Clone the selected shape in Figma as the pattern element of the grid

🟨 Creating personalized presets

🟨 Option to use a color pattern instead of random color selection

⬜ Seeds for randomness generation

⬜ Lock certain proportions (like when image editors lock aspect ratios) for horizontal and vertical element counts

✅ Loading indicator and async

✅ Multiple range slider for element opacity

✅ More shape options (triangles, hexagons, custom shapes, etc.)

✅ UI options based on icon buttons rather than dropdowns

Legend: ✅ Done, 🟦 In progress, 🟨 Planned, ⬜ Not started

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

## Known issues

### Bugs

- You cannot hit the Enter key to confirm the dialog. You have to click the 'Generate' button instead.
- Quickly hitting the 'Generate' button twice will start and stop the generation.
- Deleting the contents of the width or height inputs for the frame, clicking outside and setting it again will cause small UI issues that self-resolve.
- Deleting the contents of the width or height inputs for the frame and clicking outside will set the value to 0 instead of the previous value or the minimum allowed.
- The plugin will generate an error if you try to generate a grid with 0 elements (0 width & 0 height).

### Limitations

- There's no way to resume the generation after stopping it yet. There's also no way to modify a grid after generating it.
- You can't use a seed to generate the same grid twice. It still relies on Math.random every time.

## License

This project is under a MODIFIED [Creative Commons Zero v1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) license. See the [LICENSE](LICENSE) file for more details.

Basically, don't make money off the code itself as this is a project for the community, but please do use it to create cool designs for any purpose.
If you have better ideas for a license, please let me know. I'm not a lawyer and I'm not sure if this license is the best for this project.

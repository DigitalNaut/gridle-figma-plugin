# Gridle Plugin for Figma

## Description

This plugin allows you to create a grid pattern of squares and circles in Figma. It's great for pixelated art and background details.

## Installation

For now the only way to install this plugin is to clone this repository and run `yarn build` in the root directory. Then you can open Figma and go to `Plugins > Development > New Plugin...` and choose the `manifest.json` file in the `build` directory.

I'm working on getting this plugin into the Figma Community so it can be installed directly from Figma.

## Planned features

[ ] Seeds for randomness generation
[ ] Saving, loading and default presets
[ ] More shape options (triangles, hexagons, custom shapes, etc.)
[ ] UI options based on icon buttons rather than dropdowns
[ ] Loading indicator and async (it current blocks the main thread, whoops!)
[ ] Option to limit range of opacity for generated elements
[ ] Option to turn off randomness in favor of a color pattern
[ ] Lock certain proportions (like when image editors lock aspect ratios) for horizontal and vertical element counts

export default function MultiColorPicker({
  colors,
  colorsLimit = 24,
  handleAddColor,
  handleColorChange,
  handleRemoveColor,
}: {
  colors: string[];
  colorsLimit?: number;
  handleAddColor: () => void;
  handleColorChange: (color: string, colorIndex: number) => void;
  handleRemoveColor: (colorIndex: number) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      {`Colors (${colors.length})`}
      <div className="flex w-full flex-wrap items-center">
        {colors.map((color, colorIndex) => (
          <div key={colorIndex} className="group relative h-10 w-1/6">
            <label title="Color to use for the elements.">
              <input
                className="h-full w-full rounded-sm bg-zinc-700"
                id="colorsInput"
                name="colors"
                type="color"
                value={color}
                onChange={({ currentTarget }) =>
                  handleColorChange(currentTarget.value, colorIndex)
                }
              />
              {colorIndex > 0 && (
                <button
                  className="absolute right-0 top-0 hidden h-5 w-5 items-center justify-center rounded-full shadow-sm group-hover:flex group-hover:border group-hover:bg-zinc-600 group-hover:shadow-md"
                  title="Remove color"
                  onClick={() => handleRemoveColor(colorIndex)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </label>
          </div>
        ))}
        {colors.length < colorsLimit && (
          <button
            className="flex h-9 w-1/6 items-center justify-center rounded-md border border-zinc-200 text-xl font-bold text-zinc-200"
            title="Add color"
            onClick={handleAddColor}
          >
            <i className="fa-solid fa-plus text-sm"></i>
          </button>
        )}
      </div>
    </div>
  );
}
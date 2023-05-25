export default function MultiColorPicker({
  label,
  colors,
  colorsLimit = 24,
  onAddColor,
  onChangeColor,
  onRemoveColor,
}: {
  label: string;
  colors: string[];
  colorsLimit?: number;
  onAddColor: () => void;
  onChangeColor: (color: string, colorIndex: number) => void;
  onRemoveColor: (colorIndex: number) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      {label}
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
                  onChangeColor(currentTarget.value, colorIndex)
                }
              />
              <button
                className="absolute right-0 top-0 hidden h-5 w-5 items-center justify-center rounded-full shadow-sm group-hover:flex group-hover:border group-hover:bg-zinc-600 group-hover:shadow-md"
                title="Remove color"
                onClick={() => onRemoveColor(colorIndex)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </label>
          </div>
        ))}
        {colors.length < colorsLimit && (
          <button
            className="flex h-9 w-1/6 items-center justify-center rounded-md border border-zinc-200 text-xl font-bold text-zinc-200"
            title="Add color"
            onClick={onAddColor}
          >
            <i className="fa-solid fa-plus text-sm"></i>
          </button>
        )}
      </div>
    </div>
  );
}

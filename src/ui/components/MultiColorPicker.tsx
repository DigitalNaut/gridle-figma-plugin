import { useCallback, useState } from "react";
import {
  DndContext,
  MouseSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import { DraggableAndDroppable } from "~components/DragNDrop";
import {
  OnChangeColor,
  OnRearrangeColors,
  OnRemoveColor,
} from "~hooks/useColorHandlers";

const draggableType = Symbol("draggableType");

function ColorPicker({
  color,
  colorIndex,
  onChangeColor,
  onRemoveColor,
  disabled,
}: {
  color: string;
  colorIndex: number;
  onChangeColor: OnChangeColor;
  onRemoveColor: OnRemoveColor;
  disabled?: boolean;
}) {
  return (
    <label
      className="group relative h-full w-full"
      title="Color to use for the elements."
    >
      <input
        className="h-full w-full rounded-sm bg-zinc-700"
        id="colorsInput"
        name="colors"
        type="color"
        value={color}
        onChange={({ currentTarget }) =>
          onChangeColor(currentTarget.value, colorIndex)
        }
        disabled={disabled}
        style={{
          pointerEvents: disabled ? "none" : undefined,
        }}
      />
      {disabled || (
        <button
          className="absolute right-0 top-0 hidden h-5 w-5 items-center justify-center rounded-full shadow-sm group-hover:flex group-hover:border group-hover:bg-zinc-600 group-hover:shadow-md"
          title="Remove color"
          onClick={() => onRemoveColor(colorIndex)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </label>
  );
}

export default function MultiColorPicker({
  label,
  colors,
  colorsLimit = 24,
  onAddColor,
  onChangeColor,
  onRemoveColor,
  onRearrangeColors,
}: {
  label: string;
  colors: string[];
  colorsLimit?: number;
  onAddColor: () => void;
  onChangeColor: OnChangeColor;
  onRemoveColor: OnRemoveColor;
  onRearrangeColors: OnRearrangeColors;
}) {
  const [draggingID, setDraggingID] = useState<UniqueIdentifier>();
  const [overID, setOverID] = useState<UniqueIdentifier>();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const resetDndIDs = useCallback(() => {
    setTimeout(() => setDraggingID(undefined), 1);
    setOverID(undefined);
  }, []);

  return (
    <div className="flex w-full flex-col gap-2">
      {label}
      <DndContext
        sensors={sensors}
        modifiers={[restrictToParentElement]}
        onDragStart={({ active }) => {
          setDraggingID(active.id);
        }}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id)
            onRearrangeColors(+active.id - 1, +over.id - 1);

          resetDndIDs();
        }}
        onDragCancel={resetDndIDs}
        onDragOver={({ active, over }) => {
          if (active.id === over?.id) setOverID(undefined);
          else setOverID(over?.id);
        }}
      >
        <div className="flex w-full flex-wrap items-center">
          {colors.map((color, colorIndex) => {
            const id = colorIndex + 1; // Bugfix: 0 won't let the item be dragged
            const isDragged = draggingID === id;
            const isOver = overID === id;
            const zIndex = isDragged ? 999 : isOver ? 998 : 0;
            const outline = isOver ? "2px solid white" : undefined;

            return (
              <DraggableAndDroppable
                key={id}
                className="h-9 w-1/6"
                id={id}
                type={draggableType}
                accepts={[draggableType]}
                style={{ zIndex, outline }}
              >
                <ColorPicker
                  disabled={draggingID !== undefined}
                  {...{ color, colorIndex, onChangeColor, onRemoveColor }}
                />
              </DraggableAndDroppable>
            );
          })}
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
      </DndContext>
    </div>
  );
}

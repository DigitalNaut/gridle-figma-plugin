import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  UniqueIdentifier,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragMoveEvent,
  Over,
  Active,
} from "@dnd-kit/core";
import {
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
  DndContext,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import { DraggableAndDroppable } from "~/components/DragNDrop";
import type {
  OnChangeColor,
  OnMoveColor,
  OnSwapColors,
  OnRemoveColor,
} from "~/hooks/useColorHandlers";

const draggableType = Symbol("draggableType");

function ColorPicker({
  color,
  colorIndex,
  onChangeColor,
  disabled,
  ...props
}: DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  color: string;
  colorIndex: number;
  onChangeColor?: OnChangeColor;
  disabled?: boolean;
}) {
  const pointerEvents = useMemo(
    () => (disabled ? "none" : undefined),
    [disabled],
  );

  return (
    <label
      className="relative h-full w-full"
      title="Color to use for the elements."
    >
      <input
        className="h-full w-full rounded-sm bg-zinc-700"
        id="colorsInput"
        name="colors"
        type="color"
        value={color}
        onChange={({ currentTarget }) =>
          onChangeColor?.(currentTarget.value, colorIndex)
        }
        disabled={disabled}
        style={{
          pointerEvents,
        }}
        {...props}
      />
    </label>
  );
}

type OverPosition = "before" | "center" | "after";

function HoverIndicator({ overPosition }: { overPosition: OverPosition }) {
  return (
    <div
      className="absolute left-0 top-0 flex h-full w-full"
      style={{
        justifyContent:
          overPosition === "before"
            ? "flex-start"
            : overPosition === "after"
            ? "flex-end"
            : "center",
      }}
    >
      {/* prettier-ignore */}
      <div
        className={`left-0 top-0 flex h-full w-full items-center justify-center
                    before:absolute before:bottom-full ${overPosition === "before" ? "before:left-0 before:-translate-x-1/2" : ""} ${overPosition === "after" ? "before:right-0 before:translate-x-1/2" : ""} before:border-8 before:border-solid before:border-b-transparent before:border-l-transparent before:border-r-transparent ${overPosition !== "center" ? "before:border-t-white" : "before:border-transparent before:shadow-sm"}
                    after:absolute after:top-full ${overPosition === "before" ? "after:left-0 after:-translate-x-1/2" : ""} ${overPosition === "after" ? "after:right-0 after:translate-x-1/2" : ""} after:border-8 after:border-solid ${overPosition !== "center" ? "after:border-b-white" : "after:border-b-transparent"} after:border-l-transparent after:border-r-transparent after:border-t-transparent after:shadow-sm`}
        style={{
          borderLeft: overPosition === "before" ? "4px solid white" : undefined,
          outline: overPosition === "center" ? "4px solid white" : undefined,
          borderRight: overPosition === "after" ? "4px solid white" : undefined,
        }}
      >
        {overPosition === "center" && (
          <i className="fa-solid fa-arrows-rotate text-2xl text-white shadow-lg"></i>
        )}
      </div>
    </div>
  );
}

function AddColorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex h-9 w-1/6 items-center justify-center rounded-md border border-zinc-200 text-xl font-bold text-zinc-200"
      title="Add color"
      onClick={onClick}
    >
      <i className="fa-solid fa-plus text-sm"></i>
    </button>
  );
}

function RemoveColorButton({
  onClick,
  className,
  title,
}: {
  colorIndex: number;
  onClick: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      className={`items-center justify-center rounded-full shadow-sm group-hover:flex group-hover:border group-hover:bg-zinc-600 group-hover:shadow-md ${className}`}
      title={title}
      onClick={onClick}
    >
      <i className="fa-solid fa-xmark fa-sm"></i>
    </button>
  );
}

const addWindowMouseMoveListener = (callback: (e: MouseEvent) => void) =>
  window.addEventListener("mousemove", callback);

const removeWindowMouseMoveListener = (callback: (e: MouseEvent) => void) =>
  window.removeEventListener("mousemove", callback);

export default function MultiColorPicker({
  label,
  colors,
  colorsLimit = 24,
  onAddColor,
  onChangeColor,
  onRemoveColor,
  onMoveColor,
  onSwapColors,
}: {
  label: string;
  colors: string[];
  colorsLimit?: number;
  onAddColor: () => void;
  onChangeColor: OnChangeColor;
  onRemoveColor: OnRemoveColor;
  onMoveColor: OnMoveColor;
  onSwapColors: OnSwapColors;
}) {
  const [draggedItem, setDraggedItem] = useState<Active | null>(null);
  const [overItem, setOverItem] = useState<Over | null>(null);
  const mouseX = useRef<number | null>(null);
  const [overPosition, setOverPosition] = useState<OverPosition | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const encodeIndexToId = (id: UniqueIdentifier) => `id-${id}`;

  const decodeIdToIndex = (id: UniqueIdentifier) =>
    +(id + "").replace("id-", "");

  const resetDndIDs = useCallback(() => {
    setDraggedItem(null);
    setOverItem(null);
  }, []);

  const onMouseMove = useCallback(
    (event: MouseEvent) => (mouseX.current = event.clientX),
    [],
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    setDraggedItem(active);
    addWindowMouseMoveListener(onMouseMove);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    resetDndIDs();
    removeWindowMouseMoveListener(onMouseMove);
    mouseX.current = null;

    if (!over || active.id === over.id || overPosition === null) return;

    const activeIndex = decodeIdToIndex(active.id);
    const overIndex = decodeIdToIndex(over.id);

    if (overPosition)
      switch (overPosition) {
        case "center":
          onSwapColors(+activeIndex, overIndex);
          break;
        case "before":
          onMoveColor(activeIndex, overIndex, overPosition);
          break;
        case "after":
          onMoveColor(activeIndex, overIndex, overPosition);
          break;
      }
  };
  const onDragCancel = () => {
    resetDndIDs();
    removeWindowMouseMoveListener(onMouseMove);
    mouseX.current = null;
  };
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (active.id === over?.id) setOverItem(null);
    else {
      setOverPosition(null);
      setOverItem(over);
    }
  };
  const onDragMove = ({ over, active }: DragMoveEvent) => {
    if (!over || over.id === active.id || !mouseX.current) return;

    const halfWidthOver = over.rect.width * 0.5;
    const middleOver = over.rect.left + halfWidthOver;
    const dx = mouseX.current - middleOver;
    const threshold = halfWidthOver * 0.333;

    if (dx <= -threshold) setOverPosition("before");
    else if (dx >= threshold) setOverPosition("after");
    else setOverPosition("center");
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label}
      <DndContext
        sensors={sensors}
        modifiers={[restrictToParentElement]}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        onDragOver={onDragOver}
        onDragMove={onDragMove}
      >
        <div className="flex w-full flex-wrap items-center">
          {colors.map((color, colorIndex) => {
            const id = encodeIndexToId(colorIndex);
            const isDragged = draggedItem?.id === id;
            const isOver = overItem?.id === id;
            const zIndex = isOver ? 100 : 0;

            return (
              <DraggableAndDroppable
                key={id}
                className="group relative h-9 w-1/6"
                id={id}
                type={draggableType}
                accepts={[draggableType]}
                style={{ zIndex }}
                data={{ color }}
              >
                <ColorPicker
                  disabled={draggedItem !== null}
                  color={color}
                  colorIndex={colorIndex}
                  onChangeColor={onChangeColor}
                />
                {draggedItem === null && (
                  <RemoveColorButton
                    className="absolute right-0 top-0 hidden h-5 w-5"
                    colorIndex={colorIndex}
                    onClick={() => onRemoveColor(colorIndex)}
                    title="Remove color"
                  />
                )}
                {isOver && overPosition !== null && (
                  <HoverIndicator overPosition={overPosition} />
                )}
                {isDragged && (
                  <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/60 p-2">
                    <div className="h-full w-full border-2 border-dashed border-white" />
                  </div>
                )}
              </DraggableAndDroppable>
            );
          })}
          {colors.length < colorsLimit && (
            <AddColorButton onClick={onAddColor} />
          )}
        </div>
        {draggedItem && (
          <DragOverlay>
            <div
              className="z-[999] flex h-5 w-5 translate-x-1/2 translate-y-1/2 rounded-sm opacity-80"
              style={{
                backgroundColor: draggedItem?.data.current?.color,
              }}
            />
          </DragOverlay>
        )}
      </DndContext>
    </div>
  );
}

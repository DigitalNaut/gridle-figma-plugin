import type {
  UniqueIdentifier,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  MouseSensor,
  useSensor,
  useSensors,
  closestCorners,
  DndContext,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import { DraggableAndDroppable } from "~components/DragNDrop";
import type {
  OnChangeColor,
  OnMoveColor,
  OnSwapColors,
  OnRemoveColor,
} from "~hooks/useColorHandlers";

const draggableType = Symbol("draggableType");

function ColorPicker({
  color,
  colorIndex,
  onChangeColor,
  disabled,
}: {
  color: string;
  colorIndex: number;
  onChangeColor: OnChangeColor;
  onRemoveColor: OnRemoveColor;
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
          onChangeColor(currentTarget.value, colorIndex)
        }
        disabled={disabled}
        style={{
          pointerEvents,
        }}
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
      <div
        className="left-0 top-0 h-full w-full"
        style={{
          borderLeft: overPosition === "before" ? "4px solid #fff" : "none",
          outline: overPosition === "center" ? "4px solid #fff" : "none",
          borderRight: overPosition === "after" ? "4px solid #fff" : "none",
        }}
      />
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
      <i className="fa-solid fa-xmark"></i>
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
  const [draggingID, setDraggingID] = useState<UniqueIdentifier>();
  const [overID, setOverID] = useState<UniqueIdentifier>();
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
    setTimeout(() => setDraggingID(undefined), 1);
    setOverID(undefined);
  }, []);

  const onMouseMove = useCallback(
    (event: MouseEvent) => (mouseX.current = event.clientX),
    [],
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    setDraggingID(active.id);
    addWindowMouseMoveListener(onMouseMove);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    resetDndIDs();
    removeWindowMouseMoveListener(onMouseMove);
    mouseX.current = null;

    if (!over || active.id === over.id || overPosition === undefined) return;

    const activeIndex = decodeIdToIndex(active.id);
    const overIndex = decodeIdToIndex(over.id);

    if (overPosition !== undefined)
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
    if (active.id === over?.id) setOverID(undefined);
    else {
      setOverPosition(null);
      setOverID(over?.id);
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
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        onDragOver={onDragOver}
        onDragMove={onDragMove}
      >
        <div className="-mt-2 mb-2 flex w-full flex-wrap items-center">
          {colors.map((color, colorIndex) => {
            const id = encodeIndexToId(colorIndex);
            const isDragged = draggingID === id;
            const isOver = overID === id;
            const zIndex = isDragged ? 999 : isOver ? 998 : 0;
            const opacity = isDragged ? 0.5 : 1;

            return (
              <DraggableAndDroppable
                key={id}
                className="group relative h-9 w-1/6"
                id={id}
                type={draggableType}
                accepts={[draggableType]}
                style={{ zIndex, opacity }}
              >
                <ColorPicker
                  disabled={draggingID !== undefined}
                  {...{ color, colorIndex, onChangeColor, onRemoveColor }}
                />
                {draggingID === undefined && (
                  <RemoveColorButton
                    className="absolute right-0 top-0 hidden h-5 w-5 "
                    colorIndex={colorIndex}
                    onClick={() => onRemoveColor(colorIndex)}
                    title="Remove color"
                  />
                )}
                {isOver && overPosition !== null && (
                  <HoverIndicator overPosition={overPosition} />
                )}
              </DraggableAndDroppable>
            );
          })}
          {colors.length < colorsLimit && (
            <AddColorButton onClick={onAddColor} />
          )}
        </div>
      </DndContext>
    </div>
  );
}

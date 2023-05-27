import {
  PropsWithChildren,
  useRef,
  useEffect,
  DetailedHTMLProps,
  HTMLAttributes,
} from "react";
import {
  useDroppable,
  useDraggable,
  UseDraggableArguments,
  UseDroppableArguments,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function Droppable({
  children,
  accepts,
  id,
}: PropsWithChildren<
  Parameters<typeof useDroppable>[0] & {
    accepts: symbol[];
  }
>) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { accepts },
  });

  return (
    <div
      ref={setNodeRef}
      className="h-full w-full"
      style={{
        border: isOver ? "1px dashed #fff" : "1px dashed transparent",
        zIndex: isOver ? 0 : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function Draggable({
  children,
  type,
  id,
}: PropsWithChildren<Parameters<typeof useDraggable>[0]> & {
  type: symbol;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type },
    });

  return (
    <div
      ref={setNodeRef}
      className="h-full w-full"
      style={{
        transform: CSS.Transform.toString(transform),
        zIndex: isDragging ? 999 : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function DraggableAndDroppable({
  children,
  type,
  id,
  accepts,
  style,
  className,
}: PropsWithChildren<
  Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    "id"
  > &
    UseDraggableArguments &
    UseDroppableArguments & {
      accepts: symbol[];
    }
> & {
  type: symbol;
}): JSX.Element {
  const {
    attributes,
    listeners,
    transform,
    isDragging,
    setNodeRef: setDragRef,
  } = useDraggable({
    id,
    data: { type },
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id,
    data: { accepts },
  });
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    setDragRef(ref.current);
    setDropRef(ref.current);

    return () => {
      setDragRef(null);
      setDropRef(null);
    };
  }, [setDragRef, setDropRef]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "" : "transform 100ms linear",
        ...style,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

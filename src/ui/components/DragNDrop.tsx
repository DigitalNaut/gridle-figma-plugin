import type {
  PropsWithChildren,
  DetailedHTMLProps,
  HTMLAttributes,
} from "react";
import { useRef, useEffect } from "react";
import type {
  UseDraggableArguments,
  UseDroppableArguments,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";

export function DraggableAndDroppable({
  children,
  type,
  id,
  accepts,
  style,
  className,
  data,
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
    setNodeRef: setDragRef,
  } = useDraggable({
    id,
    data: { type, ...data },
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
        ...style,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

import type { StopCode } from "@common/index";

export type GeneratorStopCode = StopCode | "completed";

export type ShapeNode =
  | VectorNode
  | StarNode
  | LineNode
  | EllipseNode
  | PolygonNode
  | RectangleNode
  | TextNode;

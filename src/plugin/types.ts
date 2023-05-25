import type { StopCode } from "@common";

export type GeneratorStopCode = StopCode | "completed";

export type ShapeNode =
  | VectorNode
  | StarNode
  | LineNode
  | EllipseNode
  | PolygonNode
  | RectangleNode;

export type SupportedNode =
  | InstanceNode
  | FrameNode
  | ComponentSetNode
  | ComponentNode
  | StampNode
  | TextNode
  | ShapeNode;

export function isSupportedNode(node: SceneNode): node is SupportedNode {
  return (
    "resize" in node &&
    "constraints" in node &&
    "opacity" in node &&
    "fills" in node &&
    "x" in node &&
    "y" in node &&
    "relativeTransform" in node
  );
}

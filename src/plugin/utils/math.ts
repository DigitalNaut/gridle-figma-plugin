const { cos, sin, PI } = Math;

const degToRad = PI / 180;

/**
 * @see https://gist.github.com/LukeFinch/d3c93d79a9dcd6970358be1d17838318
 * @see https://stackoverflow.com/a/2259502/112731
 * @param node
 */
export function transformRotateAxis2D(
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
): Transform {
  const theta = angle * degToRad;

  const cx = x + width * 0.5;
  const cy = y + height * 0.5;

  const newX =
    cos(theta) * x + y * sin(theta) - cy * sin(theta) - cx * cos(theta) + cx;
  const newY =
    -sin(theta) * x + cx * sin(theta) + y * cos(theta) - cy * cos(theta) + cy;

  return [
    [cos(theta), sin(theta), newX],
    [-sin(theta), cos(theta), newY],
  ];
}

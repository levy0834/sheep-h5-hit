import Phaser from "phaser";

// Phaser's typings for Rectangle may not include setShadow (depending on version/types).
// At runtime it works in our build; this helper keeps CI type-check happy.
export function setShadow(
  obj: any,
  x = 0,
  y = 10,
  color = "rgba(0,0,0,0.22)",
  blur = 22,
  stroke = false,
  fill = true
): void {
  if (obj && typeof obj.setShadow === "function") {
    obj.setShadow(x, y, color, blur, stroke, fill);
  }
}

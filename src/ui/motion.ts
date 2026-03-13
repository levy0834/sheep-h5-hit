import Phaser from "phaser";

export const MOTION = {
  fast: 110,
  press: 82,
  settle: 180,
  float: 2600,
  glow: 3200
} as const;

export function applyPressBounce(
  scene: Phaser.Scene,
  targets: any,
  onComplete: () => void,
  scale = 0.95
): void {
  scene.tweens.add({
    targets,
    scaleX: scale,
    scaleY: scale,
    duration: MOTION.press,
    yoyo: true,
    ease: "Quad.easeOut",
    onComplete,
    onStop: onComplete
  });
}

export function addFloatMotion(
  scene: Phaser.Scene,
  target: any,
  distance = 8,
  duration: number = MOTION.float,
  delay = 0
): void {
  scene.tweens.add({
    targets: target,
    y: `-=${distance}`,
    duration,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
    delay
  });
}

export function addPulseMotion(
  scene: Phaser.Scene,
  target: any,
  options?: {
    scaleFrom?: number;
    scaleTo?: number;
    alphaFrom?: number;
    alphaTo?: number;
    duration?: number;
    delay?: number;
  }
): void {
  const {
    scaleFrom = 0.98,
    scaleTo = 1.04,
    alphaFrom = 0.72,
    alphaTo = 1,
    duration: durationArg = MOTION.glow,
    delay = 0
  } = options ?? {};
  const duration = typeof durationArg === "number" ? durationArg : MOTION.glow;

  target.setScale(scaleFrom);
  target.setAlpha(alphaFrom);
  scene.tweens.add({
    targets: target,
    scaleX: scaleTo,
    scaleY: scaleTo,
    alpha: alphaTo,
    duration,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
    delay
  });
}

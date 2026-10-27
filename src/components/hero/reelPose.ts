/**
 * Pose maths for the hero reel cylinder. Pure functions, no DOM: the whole entrance is driven by
 * two numbers, `formation` (the loader deal, 0..1) and `expansion` (the reveal, 0..1).
 *
 * Angles are in degrees. 0 is the far centre of the ring (facing the camera), ±180 is the card
 * nearest the camera. A card at angle a sits at x = -sin(a)·R, z = -cos(a)·R and is turned by yaw = a,
 * so it always faces the centre of the cylinder.
 */

export type Scene = {
  radius: number; // px
  tilt: number; // deg, rotateX of the ring (negative = seen from above)
  roll: number; // deg, dutch angle (rotateZ)
  perspective: number; // px, CSS perspective = camera distance from the ring centre
  scale: number; // card scale
};

export type Pose = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
  appear: number; // 0..1 opacity while the card is dealt
  behindCamera: boolean; // true when the card is behind (or too close to) the camera
};

export const SLOTS = 16;
export const CARD_W = 270;
export const CARD_H = 480;

/** Expansion 0: small ring seen from above and outside. Expansion 1: large ring, camera inside. */
export const SCENE_FROM: Scene = { radius: 460, tilt: -22, roll: -20, perspective: 1000, scale: 0.52 };
export const SCENE_TO: Scene = { radius: 1800, tilt: 0, roll: 0, perspective: 450, scale: 2.3 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** Wrap any angle to [-180, 180). */
export function wrapDeg(a: number) {
  return ((((a + 180) % 360) + 360) % 360) - 180;
}

/** The scene at a given (already eased) expansion value. */
export function sceneAt(expansion: number): Scene {
  const e = clamp01(expansion);
  return {
    radius: lerp(SCENE_FROM.radius, SCENE_TO.radius, e),
    tilt: lerp(SCENE_FROM.tilt, SCENE_TO.tilt, e),
    roll: lerp(SCENE_FROM.roll, SCENE_TO.roll, e),
    perspective: lerp(SCENE_FROM.perspective, SCENE_TO.perspective, e),
    scale: lerp(SCENE_FROM.scale, SCENE_TO.scale, e),
  };
}

/** Resting angle of a slot. */
export const slotAngle = (slot: number, slots = SLOTS) => (slot * 360) / slots;

/**
 * Where a card is in the deal (0 = dealt first, just after the front of the ring; →1 = dealt last).
 * The deal starts at the front (180°) and travels around the ring in the positive direction.
 */
export function dealOrder(angle: number) {
  return (((angle - 180) % 360) + 360) % 360 / 360;
}

/** How far through its own swing a card is, for a given formation value. */
export function dealProgress(angle: number, formation: number) {
  const SWING = 0.35; // each card swings for 35% of the formation…
  const start = dealOrder(angle) * (1 - SWING); // …starting one after another
  return easeOutCubic((formation - start) / SWING);
}

/**
 * The pose of one card.
 * @param angle  the card's resting angle on the ring right now (slot angle + ring spin), degrees
 * @param formation 0..1, the loader deal
 * @param scene the ring at the current expansion (see sceneAt)
 */
export function reelPose(angle: number, formation: number, scene: Scene): Pose {
  const rest = wrapDeg(angle);
  const p = dealProgress(rest, formation);
  // every card starts stacked at the front (180°) and swings forward around the ring to its rest
  const travel = (((rest - 180) % 360) + 360) % 360;
  const a = wrapDeg(180 + travel * p);
  const rad = (a * Math.PI) / 180;
  const x = -Math.sin(rad) * scene.radius;
  const z = -Math.cos(rad) * scene.radius;
  // the camera sits `perspective` px in front of the ring centre; anything at or past it is hidden
  const halfWidth = (CARD_W * scene.scale) / 2;
  const behindCamera = z > scene.perspective - halfWidth * 1.4;
  return {
    x,
    y: 0,
    z,
    yaw: a,
    scale: scene.scale,
    appear: clamp01(p / 0.15), // fades in as soon as its swing starts, so the waiting stack is never seen
    behindCamera,
  };
}

/** Which reel a slot shows: slots recycle a new reel each time they pass behind the camera (180°). */
export function reelForSlot(slot: number, spin: number, reelCount: number, slots = SLOTS) {
  const turns = Math.floor((slotAngle(slot, slots) + spin + 180) / 360);
  return (((slot + slots * turns) % reelCount) + reelCount) % reelCount;
}

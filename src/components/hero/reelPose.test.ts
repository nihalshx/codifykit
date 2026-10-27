// Run with: npm test   (Node's built-in test runner, TypeScript via --experimental-strip-types)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SCENE_FROM,
  SCENE_TO,
  SLOTS,
  dealOrder,
  dealProgress,
  reelForSlot,
  reelPose,
  sceneAt,
  slotAngle,
  wrapDeg,
} from "./reelPose.ts";

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("wrapDeg keeps angles in [-180, 180)", () => {
  close(wrapDeg(0), 0);
  close(wrapDeg(190), -170);
  close(wrapDeg(-190), 170);
  close(wrapDeg(540), -180);
  close(wrapDeg(720 + 45), 45);
});

test("sceneAt interpolates every value from SCENE_FROM to SCENE_TO", () => {
  assert.deepEqual(sceneAt(0), SCENE_FROM);
  assert.deepEqual(sceneAt(1), SCENE_TO);
  const mid = sceneAt(0.5);
  close(mid.radius, (460 + 1800) / 2);
  close(mid.tilt, -11);
  close(mid.roll, -10);
  close(mid.perspective, (1000 + 450) / 2);
  close(mid.scale, (0.52 + 2.3) / 2);
  assert.deepEqual(sceneAt(-1), SCENE_FROM, "clamps below 0");
  assert.deepEqual(sceneAt(2), SCENE_TO, "clamps above 1");
});

test("a fully formed card sits on the cylinder: x = -sin(a)·R, z = -cos(a)·R, yaw = a", () => {
  const scene = sceneAt(1);
  for (const a of [0, 30, 90, -60, 135]) {
    const p = reelPose(a, 1, scene);
    const r = (a * Math.PI) / 180;
    close(p.x, -Math.sin(r) * scene.radius, 1e-6);
    close(p.z, -Math.cos(r) * scene.radius, 1e-6);
    close(p.yaw, a);
    close(p.y, 0);
    close(p.scale, scene.scale);
    close(p.appear, 1);
  }
});

test("angle 0 is the far centre of the ring, ±180 is nearest the camera", () => {
  const scene = sceneAt(1);
  const far = reelPose(0, 1, scene);
  close(far.x, 0, 1e-9);
  close(far.z, -scene.radius);
  const near = reelPose(180, 1, scene);
  close(near.z, scene.radius);
});

test("inside the ring the cards behind the camera are hidden; the far wall is not", () => {
  const scene = sceneAt(1); // radius 1800, camera 450px from the centre
  assert.equal(reelPose(0, 1, scene).behindCamera, false);
  assert.equal(reelPose(60, 1, scene).behindCamera, false);
  assert.equal(reelPose(180, 1, scene).behindCamera, true);
  assert.equal(reelPose(-150, 1, scene).behindCamera, true);
});

test("outside the small ring (expansion 0) nothing is behind the camera", () => {
  const scene = sceneAt(0);
  for (let s = 0; s < SLOTS; s++) assert.equal(reelPose(slotAngle(s), 1, scene).behindCamera, false);
});

test("before the deal every card is stacked at the front and invisible", () => {
  const scene = sceneAt(0);
  for (let s = 0; s < SLOTS; s++) {
    const p = reelPose(slotAngle(s), 0, scene);
    close(Math.abs(p.yaw), 180);
    close(p.appear, 0);
  }
});

test("the deal travels around the ring: cards just past the front are dealt first", () => {
  assert.ok(dealOrder(-170) < dealOrder(-90));
  assert.ok(dealOrder(-90) < dealOrder(0));
  assert.ok(dealOrder(0) < dealOrder(90));
  assert.ok(dealOrder(90) < dealOrder(170));
  // halfway through, an early card is further along than a late one
  assert.ok(dealProgress(-150, 0.5) > dealProgress(150, 0.5));
});

test("each card swings out with an ease-out and lands exactly on its rest angle", () => {
  const scene = sceneAt(0.3);
  const a = 45;
  const early = reelPose(a, 0.55, scene).yaw;
  const landed = reelPose(a, 1, scene).yaw;
  close(landed, a);
  // still on the way: somewhere between the front (180) and the rest angle, moving forward
  assert.ok(early > -180 && early < 180);
  // monotonic: progress never goes backwards as formation grows
  let last = -1;
  for (let f = 0; f <= 1.0001; f += 0.05) {
    const p = dealProgress(a, f);
    assert.ok(p >= last - 1e-9);
    last = p;
  }
  close(dealProgress(a, 1), 1);
});

test("slots recycle a new reel each time they pass behind the camera", () => {
  const reels = 34;
  assert.equal(reelForSlot(0, 0, reels), 0);
  assert.equal(reelForSlot(5, 0, reels), 5);
  // slot 0 rests at 0°; after spinning 180° it reaches the back and takes the next reel set
  assert.equal(reelForSlot(0, 179, reels), 0);
  assert.equal(reelForSlot(0, 181, reels), 16);
  assert.equal(reelForSlot(0, 181 + 360, reels), 32);
  assert.equal(reelForSlot(3, 181 + 720, reels), (3 + 48) % reels);
  // works when spinning the other way too
  assert.equal(reelForSlot(0, -181, reels), (0 - 16 + reels * 2) % reels);
});

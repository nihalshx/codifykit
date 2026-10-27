// One-off build script for public/models/laptop.glb (see public/models/CREDITS.md).
// Usage: node scripts/split-macbook.mjs <sketchfab-macbook.glb> <out.glb> [sideInset,topInset,bottomInset]
// Needs @gltf-transform/core and @gltf-transform/extensions (npx/npm i -D).
// Split the Sketchfab MacBook (one mesh) into base + hinged lid, and add a separate "screen" plane.
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [src, out, insetArg] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const root = doc.getRoot();
const prim = root.listMeshes()[0].listPrimitives()[0];
const material = prim.getMaterial();
const A = { POSITION: prim.getAttribute('POSITION'), NORMAL: prim.getAttribute('NORMAL'), TEXCOORD_0: prim.getAttribute('TEXCOORD_0') };
const idx = prim.getIndices().getArray();
const n = A.POSITION.getCount();
// bake the Sketchfab root rotation (-90° about X): (x, y, z) -> (x, z, -y)
const toY = ([x, y, z]) => [x, z, -y];
const P = [], N = [], T = [];
for (let i = 0; i < n; i++) { P.push(toY(A.POSITION.getElement(i, []))); N.push(toY(A.NORMAL.getElement(i, []))); T.push(A.TEXCOORD_0.getElement(i, [])); }
// classify triangles
const lidTris = [], baseTris = [];
for (let t = 0; t < idx.length; t += 3) {
  const tri = [idx[t], idx[t + 1], idx[t + 2]];
  (tri.some(i => P[i][1] > 0.1) ? lidTris : baseTris).push(tri);
}
// hinge: bottom edge of the lid
const lidVerts = [...new Set(lidTris.flat())];
const bottom = lidVerts.filter(i => P[i][1] < 0.05);
const hy = bottom.reduce((s, i) => s + P[i][1], 0) / bottom.length;
const hz = bottom.reduce((s, i) => s + P[i][2], 0) / bottom.length;
const topV = lidVerts.filter(i => P[i][1] > 0.1);
const ty = topV.reduce((s, i) => s + P[i][1], 0) / topV.length;
const tz = topV.reduce((s, i) => s + P[i][2], 0) / topV.length;
const phi = Math.atan2(-(tz - hz), ty - hy); // lean-back angle from vertical
console.log('hinge', hy.toFixed(4), hz.toFixed(4), 'lean deg', (phi * 180 / Math.PI).toFixed(1), 'lid tris', lidTris.length, 'base tris', baseTris.length);
const rotX = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];

const out_ = new Document();
out_.getRoot().getAsset().extras = { ...root.getAsset().extras, note: 'Split into base + hinged lid (node "screenflip") with a separate "screen" plane for the site. Lid stands upright when screenflip.rotation.x = 0.' };
const buf = out_.createBuffer();
// copy material + textures
const mat = out_.createMaterial('macbookpro').setMetallicFactor(material.getMetallicFactor()).setRoughnessFactor(material.getRoughnessFactor()).setBaseColorFactor(material.getBaseColorFactor());
const copyTex = (t) => t && out_.createTexture(t.getName()).setImage(t.getImage()).setMimeType(t.getMimeType());
mat.setBaseColorTexture(copyTex(material.getBaseColorTexture()));
mat.setNormalTexture(copyTex(material.getNormalTexture()));
mat.setMetallicRoughnessTexture(copyTex(material.getMetallicRoughnessTexture()));
mat.setOcclusionTexture(copyTex(material.getOcclusionTexture()));
mat.setEmissiveTexture(copyTex(material.getEmissiveTexture())).setEmissiveFactor(material.getEmissiveFactor());

function makeMesh(name, tris, xf) {
  const map = new Map(), pos = [], nor = [], uv = [], ind = [];
  for (const tri of tris) for (const i of tri) {
    if (!map.has(i)) {
      map.set(i, pos.length / 3);
      const [p, nn] = xf(P[i], N[i]);
      pos.push(...p); nor.push(...nn); uv.push(...T[i]);
    }
    ind.push(map.get(i));
  }
  const prim = out_.createPrimitive()
    .setAttribute('POSITION', out_.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buf))
    .setAttribute('NORMAL', out_.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buf))
    .setAttribute('TEXCOORD_0', out_.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buf))
    .setIndices(out_.createAccessor().setType('SCALAR').setArray(new Uint16Array(ind)).setBuffer(buf))
    .setMaterial(mat);
  return out_.createMesh(name).addPrimitive(prim);
}
const baseMesh = makeMesh('base', baseTris, (p, nn) => [p, nn]);
// lid: move to the hinge, stand it upright
const lidMesh = makeMesh('lid', lidTris, (p, nn) => [rotX([p[0], p[1] - hy, p[2] - hz], phi), rotX(nn, phi)]);
// measure the upright lid
let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
const la = lidMesh.listPrimitives()[0].getAttribute('POSITION');
for (let i = 0; i < la.getCount(); i++) { const v = la.getElement(i, []); v.forEach((c, k) => { mn[k] = Math.min(mn[k], c); mx[k] = Math.max(mx[k], c); }); }
console.log('lid bounds', mn.map(v => v.toFixed(4)), mx.map(v => v.toFixed(4)));
// screen plane on the front of the lid (insets: side, top, bottom as fractions of lid width/height)
const [side, top, bot] = (insetArg || '0.018,0.03,0.035').split(',').map(Number);
const W = mx[0] - mn[0], H = mx[1] - mn[1];
const x0 = mn[0] + W * side, x1 = mx[0] - W * side, y0 = mn[1] + H * bot, y1 = mx[1] - H * top, z = mx[2] + 0.0004;
const screenMat = out_.createMaterial('screen').setBaseColorFactor([0.05, 0.05, 0.08, 1]).setMetallicFactor(0).setRoughnessFactor(0.2);
const sp = out_.createPrimitive()
  .setAttribute('POSITION', out_.createAccessor().setType('VEC3').setArray(new Float32Array([x0, y1, z, x1, y1, z, x0, y0, z, x1, y0, z])).setBuffer(buf))
  .setAttribute('NORMAL', out_.createAccessor().setType('VEC3').setArray(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1])).setBuffer(buf))
  .setAttribute('TEXCOORD_0', out_.createAccessor().setType('VEC2').setArray(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])).setBuffer(buf))
  .setIndices(out_.createAccessor().setType('SCALAR').setArray(new Uint16Array([0, 2, 1, 1, 2, 3])).setBuffer(buf))
  .setMaterial(screenMat);
const screenMesh = out_.createMesh('screen').addPrimitive(sp);
console.log('screen size', (x1 - x0).toFixed(4), (y1 - y0).toFixed(4), 'aspect', ((x1 - x0) / (y1 - y0)).toFixed(3));
const scene = out_.createScene('Scene');
const rootNode = out_.createNode('Macbook');
const baseNode = out_.createNode('base').setMesh(baseMesh);
const hinge = out_.createNode('screenflip').setTranslation([0, hy, hz]);
hinge.addChild(out_.createNode('lid').setMesh(lidMesh)).addChild(out_.createNode('display').setMesh(screenMesh));
rootNode.addChild(baseNode).addChild(hinge);
scene.addChild(rootNode);
out_.getRoot().setDefaultScene(scene);
await new NodeIO().write(out, out_);
console.log('wrote', out);

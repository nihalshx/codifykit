# Generates public/images/graph-paper.webp: crumpled graph paper (diagonal folds lit from the top-left,
# light-blue 28px grid bent slightly by the folds). Run: python3 scripts/make-graph-paper.py [grid px]
# Needs numpy and Pillow; writes graph-paper.png/.webp to the current folder.
import numpy as np, sys
from PIL import Image, ImageFilter
W, H = 2400, 1600
rng = np.random.default_rng(11)
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
h = np.zeros((H, W), np.float32)
# folds: mostly diagonal (top-left to bottom-right is the reference's main direction)
for k in range(46):
    ang = np.deg2rad(rng.normal(-22, 18))
    cx, cy = rng.uniform(-200, W + 200), rng.uniform(-200, H + 200)
    nx, ny = -np.sin(ang), np.cos(ang)            # normal of the fold line
    tx, ty = np.cos(ang), np.sin(ang)             # along the line
    d = (x - cx) * nx + (y - cy) * ny             # signed distance to the fold
    t = (x - cx) * tx + (y - cy) * ty             # position along it
    L = rng.uniform(250, 1300)
    fade = np.clip(1 - np.abs(t) / L, 0, 1) ** 0.8  # folds fade out at their ends
    w = rng.uniform(40, 160)
    a = rng.uniform(6, 22) * rng.choice([-1, 1])
    h += a * np.exp(-np.abs(d) / w) * fade        # sharp crease at d = 0
# a little fine wrinkle
noise = Image.fromarray((rng.random((H // 24, W // 24)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(14))
h += (np.asarray(noise, np.float32) / 255 - 0.5) * 1.6
# light it
gy, gx = np.gradient(h)
nz = np.ones_like(h)
n = np.sqrt(gx * gx + gy * gy + nz * nz)
lx, ly, lz = -0.55, -0.65, 0.52
lnorm = np.sqrt(lx * lx + ly * ly + lz * lz)
shade = (-gx * lx - gy * ly + nz * lz) / (n * lnorm)
base = lz / lnorm
s = np.clip((shade - base) * 1.6, -1, 0.35)      # mostly shadows, a little highlight
paper = np.empty((H, W, 3), np.float32)
paper[..., 0] = 247 + s * 70
paper[..., 1] = 248 + s * 68
paper[..., 2] = 250 + s * 62
paper = np.clip(paper, 150, 255)
# grid: crisp light-blue lines every 28px, slightly bent by the folds
step = float(sys.argv[1]) if len(sys.argv) > 1 else 28
disp = 0.35
gxp = (x + gx * disp * 6) % step
gyp = (y + gy * disp * 6) % step
line = np.minimum(np.minimum(gxp, step - gxp), np.minimum(gyp, step - gyp))
alpha = np.clip(1.1 - line, 0, 1) * 0.75
blue = np.array([118, 168, 222], np.float32)
# lines take the paper's shading too
lineCol = blue[None, None, :] * (paper / 248)
out = paper * (1 - alpha[..., None]) + lineCol * alpha[..., None]
Image.fromarray(out.astype(np.uint8)).save("graph-paper.png")
Image.fromarray(out.astype(np.uint8)).save("graph-paper.webp", quality=82, method=6)

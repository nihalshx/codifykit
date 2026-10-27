# 3D model credits

| File | Model | Author | Source | Licence |
|---|---|---|---|---|
| `laptop.glb` | Apple MacBook Pro | Andrey 3D (https://sketchfab.com/Andrey3Ds) | https://sketchfab.com/3d-models/apple-macbook-pro-eddf60ccdaba497c9e256e64bd0946d9 | Sketchfab Standard (https://sketchfab.com/licenses) |
| `phone.glb` | Apple iPhone 18 Pro Max Black 2026 | extraakash (https://sketchfab.com/AakashMansukhani) | https://sketchfab.com/3d-models/apple-iphone-18-pro-max-black-2026-8fd804a9b0ea49249de3f1e0450fbc9c | Sketchfab Standard (https://sketchfab.com/licenses) |

How they were prepared:

- **laptop.glb**: the Sketchfab file is a single mesh. `scripts/split-macbook.mjs` splits it into a base, a lid on a hinge node (`screenflip`) and a separate `screen` plane that shows the website screenshots. It was then compressed with glTF-Transform (meshopt geometry, WebP textures at 1024px, `--prune-attributes false` so the screen keeps its UVs).
- **phone.glb**: compressed the same way. Its screen material (`COLOUR_Black_Screen`) shows the poster posts.

Both models show Apple products, including the Apple logo.

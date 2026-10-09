# assets

Source assets imported by components (bundled by Next.js):

- `images/` — static images imported via `import img from "@/assets/images/..."`
- `fonts/` — local font files, if we move off Google Fonts

Runtime-loaded 3D files live in `/public/3d models/` (folder name contains a
space — always build URLs with `modelUrl()` from `src/data/models.ts`).

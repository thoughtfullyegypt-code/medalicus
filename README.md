# Medalicus — Clean Foundation

Medalicus is being rebuilt as a source-first clinical learning studio. The previous procedural anatomy, primitive-shape cardiac construction, generated projection imagery, and simulated echo presentation have been removed from this branch.

## Current status

This branch is an intentional blank foundation. It contains the app shell and separated workspaces, but **does not render anatomical meshes or echo frames**. No synthetic object is shown as if it were real clinical or anatomical data.

## Rebuild sequence

1. **Choose and validate assets** — source provenance, license, stable revision, scale, coordinate system, mesh quality, labels, and visible orientation must be reviewed.
2. **Build the 3D anatomy core** — use a genuine mesh with camera framing, controlled lighting, orbit/zoom, object picking, and structure metadata. Do not approximate anatomy with primitive geometry.
3. **Build the Echo Lab independently** — start from actual de-identified ultrasound cine or openly licensed teaching clips, with frame stepping, playback, view/study labels, and learning annotations. Do not imitate echo with generated 2D shapes.
4. **Add guided learning** — annotations, cases, checkpoints, and quizzes only after the underlying content is trustworthy.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

## Scope and safety

This project is for medical education, not diagnosis or clinical decision-making. Any future anatomy models and ultrasound clips must carry traceable provenance and suitable redistribution rights. Placeholder and synthetic visuals must never be presented as real anatomy or real patient imaging.

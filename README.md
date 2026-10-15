# Medalicus — 3D Spatial Anatomy & Multi-Planar PACS Simulator

> An interactive 3D medical education platform bridging spatial cardiac & multi-system anatomy with 2D clinical imaging projections (Cath Lab Fluoroscopy & Echocardiography).

---

## 🌟 Overview

Medalicus is designed to bridge the mental leap between **3D spatial anatomy** and **2D cross-sectional clinical imaging**. Drawing architectural inspiration from leading coronary simulators (*learncoronary.com* and *angioview.com*), Medalicus enables medical students, cardiology fellows, and radiology residents to:

- **Orbit, Zoom & Slice Authentic 3D Cardiac Anatomy** derived from the Japanese **BodyParts3D 4.0** CT database.
- **Manipulate a Virtual C-Arm Gantry** (RAO/LAO primary angles and Cranial/Caudal secondary angles) to observe real-time perspective cone-beam fluoroscopic projection physics.
- **Inspect Clinical SYNTAX Score Segments** with tapering millimeter radii and culprit STEMI stenosis lesions.
- **Master Transthoracic Echocardiography (TTE)** using anatomical cut plane slicing for Parasternal Long Axis (PLAX), Parasternal Short Axis (PSAX), Apical 4-Chamber (A4C), and Subcostal views.
- **Explore 8 Organ Systems**: Cardiovascular, Neurology, Pulmonology, Gastroenterology, Nephrology, MSK, Obstetrics, and Ophthalmology.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Node.js 18+ (tested on Node v20/v22)
- Python 3.8+ (for pipeline scripts & production static server)

### 1. Installation
```bash
git clone https://github.com/thoughtfullyegypt-code/medalicus.git
cd medalicus
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Serve Production Bundle
```bash
npm run build
python3 scripts/serve.py 3000 dist
```
Open [http://localhost:3000](http://localhost:3000). The custom `scripts/serve.py` server guarantees correct MIME types for `.glb` (`model/gltf-binary`), `.gltf`, `.wasm`, and `.json` assets.

---

## 🧬 Reproducible Anatomical Ingestion Pipeline

Medalicus converts clinical CT centrelines into Three.js tube splines with authentic tapering millimeter radii:

```bash
# Execute the BodyParts3D 4.0 coronary centerline conversion pipeline
python3 scripts/pipeline/build_bodyparts3d_coronary.py
```
This script reads the raw coordinates, aligns them with the cardiac isocenter $(x_0, y_0, z_0) = (20.026, -123.4, 1226.978)\text{ mm}$, scales them to scene units, and outputs:
- `public/data/bodyparts3d_coronary.json` (Web manifest)
- `src/data/bodyparts3dCoronary.ts` (Typed clinical dataset)

---

## ☁️ Deployment Instructions

### Option A: 1-Click Google Colab & Cloudflare Tunnel
1. Open Google Colab and upload `Medalicus_Google_Colab_Viewer.ipynb`.
2. Follow the 3 cells in the notebook:
   - Cell 1: Clones/unpacks Medalicus.
   - Cell 2: Starts the MIME-compliant production server on port 3000 (`python3 scripts/serve.py 3000 dist`).
   - Cell 3: Launches a free, secure `trycloudflare.com` public tunnel.

### Option B: Vercel / Netlify / GitHub Pages
Medalicus is configured with `base: './'` in `vite.config.ts`, making it 100% portable to any static hosting provider or subpath:
```bash
npm run build
# Deploy the generated dist/ folder directly to your hosting provider
```

---

## 📚 Attributions & Open Licenses

Medalicus uses exclusively open-source, licensed anatomical datasets:

| Dataset / Asset | Source / Author | License | Description |
| :--- | :--- | :--- | :--- |
| **BodyParts3D 4.0** | Database Center for Life Science (DBCLS), Japan | **CC BY 4.0** | Heart chambers, aortic root, pulmonary trunk, coronary centrelines and tapering radii. |
| **SYNTAX Segments** | Sianos et al., EuroIntervention 2005 (EACTS/ESC) | Clinical Standard | Official anatomical coronary segment numbers (1–16c). |
| **Realistic Heart Mesh** | *neshallads* (Sketchfab) | **CC BY 4.0** | High-yield ventricular sulci, aortic root, and myocardial surface rendering. |
| **EchoNet-Dynamic** | Stanford University | **MIT / Research** | Chamber contour traces and ejection fraction calculations. |
| **TotalSegmentator v2** | Wasserthal et al., Radiology 2023 | **Apache 2.0** | Multi-organ CT/MRI segmentation classes. |

---

## ⚠️ Medical Safety Disclaimer

> **FOR EDUCATIONAL USE ONLY.**  
> Medalicus is an interactive spatial teaching simulator created for medical students, cardiology fellows, residents, and healthcare educators. The 3D anatomical models and simulated radiographic projections are simplified for pedagogical clarity and are **not clinically validated** or FDA-approved. This application must **NOT** be used for diagnostic purposes, patient-specific surgical planning, or real-world clinical decision-making.

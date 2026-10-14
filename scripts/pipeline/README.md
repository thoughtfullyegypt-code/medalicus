# Medalicus Cloud Ingestion Pipeline (Google Colab - 0 MB Local Internet Quota)

This pipeline runs 100% in the cloud on **Google Colab** (with free GPU and Google's high-speed internet), consuming **0 MB of your local internet quota**.

---

## 🚀 1-Click Execution Instructions

1. Open [Google Colab](https://colab.research.google.com/) and create a new notebook.
2. Select **Runtime > Change runtime type > T4 GPU**.
3. Copy and run the following shell command block inside a single Colab cell:

```bash
# 1. Clone your repository (uses Google's cloud bandwidth, 0 MB of your quota)
!git clone https://github.com/your-username/Medalicus.git /content/Medalicus
%cd /content/Medalicus

# 2. Install open-source segmentation libraries on Google's cloud server
!pip install -q TotalSegmentator monai torch torchvision nibabel SimpleITK opencv-python

# 3. Execute the ingestion pipelines
!python scripts/pipeline/ingest_arcade.py
!python scripts/pipeline/ingest_echonet.py
!python scripts/pipeline/ingest_totalsegmentator.py

# 4. Zip the lightweight generated JSON / SVG files for your web app
!zip -r medalicus_processed_data.zip public/data/
```

4. Download the tiny `medalicus_processed_data.zip` (only a few hundred KB of JSON manifests and SVG tracks) and extract it into your project's `/public/data/` folder.

---

## 🧠 Models Used (100% Free & Open-Source)
- **TotalSegmentator v2 (Apache 2.0)**: Whole-body 104 CT classes, 59 MRI classes, Couinaud liver segments, and coronary centerlines.
- **EchoNet-Dynamic (Academic/MIT)**: 10,030 Apical-4-Chamber echocardiography chamber segmentations and Ejection Fraction calculation.
- **ARCADE Dataset (Zenodo/HF)**: Expert SYNTAX coronary vessel segments in COCO JSON.

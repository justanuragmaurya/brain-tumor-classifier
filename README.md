---
title: Brain Tumor CNN
emoji: 🧠
colorFrom: gray
colorTo: blue
sdk: docker
pinned: false
---

# Brain Tumor MRI Classifier

A web app that classifies brain MRI scans into four categories — **glioma**, **meningioma**, **no tumor**, and **pituitary** — using a custom CNN built with PyTorch.

## Prerequisites

- Python 3.10+
- Node 18+
- CUDA (optional, speeds up training)

## Configuration

All config is driven by environment variables with sensible defaults.

**Backend** (via `backend/config.py`):

| Variable    | Default     | Description                  |
|-------------|-------------|------------------------------|
| `PORT`      | `8080`      | Flask server port            |
| `HOST`      | `0.0.0.0`  | Flask bind address           |
| `MODEL_DIR` | `../model`  | Path to model directory      |
| `DEBUG`     | `false`     | Enable Flask debug mode      |

**Frontend** (via Vite env at build time):

| Variable       | Default | Description                                      |
|----------------|---------|--------------------------------------------------|
| `VITE_API_URL` | `""`    | API base URL. Empty = same-origin (proxy/Docker). Set to full URL for external API. |

## Setup

### 1. Download the dataset

Download the [Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset) from Kaggle and unzip it into `./data/` so the structure looks like:

```
data/
├── Training/
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
└── Testing/
    ├── glioma/
    ├── meningioma/
    ├── notumor/
    └── pituitary/
```

### 2. Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Train the model

```bash
python train.py
```

This takes ~15–25 minutes on a GPU, or ~60 minutes on CPU. Expected test accuracy: **~82–88%**.

The trained model is saved to `model/best_model.pt` and class names to `model/class_names.json`.

### 4. Run locally

**Option A — Without Docker:**

```bash
# Terminal 1: backend
cd backend && python app.py

# Terminal 2: frontend
cd frontend && npm install && npm run dev
```

**Option B — With Docker Compose:**

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Deploy to Hugging Face Spaces

The repo includes a root `Dockerfile` that bundles both frontend and backend into a single container for HF Spaces.

### Step 1 — Create the Space

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Name it (e.g. `brain-tumor-classifier`)
3. Select **Docker** as the SDK
4. Choose **Free CPU basic** (16 GB RAM)
5. Click **Create Space**

### Step 2 — Push your code

```bash
# Add the HF Space as a remote (replace YOUR_USERNAME)
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/brain-tumor-classifier

# Make sure model weights are tracked (best_model.pt is ~50MB)
# If >10MB, install git-lfs first:
git lfs install
git lfs track "*.pt"
git add .gitattributes

# Commit and push
git add .
git commit -m "deploy brain tumor classifier"
git push hf main
```

### Step 3 — Wait for build

HF Spaces will detect the root `Dockerfile`, build the image, and deploy it. The build takes ~5–10 minutes (PyTorch install is heavy). Once done, your app is live at:

```
https://YOUR_USERNAME-brain-tumor-classifier.hf.space
```

### How it works on HF Spaces

- HF Spaces expects port **7860** — the root `Dockerfile` and `hf-nginx.conf` are set up for this
- nginx serves the React frontend on 7860 and proxies `/predict` to Flask on 8080 internally
- `start.sh` boots Flask in the background, then runs nginx in the foreground

## Usage

1. Open the app in your browser
2. Upload or drag-and-drop a brain MRI image
3. Click **Classify**
4. View the predicted tumor type with confidence scores and top-3 predictions

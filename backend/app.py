import os
import json
import torch
import torch.nn as nn
from torchvision import transforms
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
from config import PORT, HOST, MODEL_DIR, DEBUG

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")


class BrainTumorCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 8 * 8, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 4),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


model = BrainTumorCNN()
model.load_state_dict(
    torch.load(
        os.path.join(MODEL_DIR, "best_model.pt"),
        map_location=torch.device("cpu"),
    )
)
model.eval()

with open(os.path.join(MODEL_DIR, "class_names.json")) as f:
    class_names = json.load(f)

transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

app = Flask(__name__)
CORS(app)


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        image = Image.open(file.stream).convert("RGB")
        tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]

        top3_probs, top3_indices = torch.topk(probabilities, 3)

        top3 = [
            {
                "class": class_names[idx.item()],
                "probability": round(prob.item(), 4),
            }
            for prob, idx in zip(top3_probs, top3_indices)
        ]

        return jsonify({
            "predicted_class": top3[0]["class"],
            "confidence": top3[0]["probability"],
            "top3": top3,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/samples", methods=["GET"])
def list_samples():
    result = {}
    for cls in class_names:
        cls_dir = os.path.join(SAMPLES_DIR, cls)
        if not os.path.isdir(cls_dir):
            result[cls] = []
            continue
        files = sorted(
            f for f in os.listdir(cls_dir)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        result[cls] = files
    return jsonify(result)


@app.route("/samples/<class_name>/<filename>", methods=["GET"])
def serve_sample(class_name, filename):
    if class_name not in class_names:
        return jsonify({"error": "Invalid class"}), 404
    cls_dir = os.path.join(SAMPLES_DIR, class_name)
    return send_from_directory(cls_dir, filename)


if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=DEBUG)
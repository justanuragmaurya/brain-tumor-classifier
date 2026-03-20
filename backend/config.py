import os

PORT = int(os.environ.get("PORT", 8080))
HOST = os.environ.get("HOST", "0.0.0.0")
MODEL_DIR = os.environ.get(
    "MODEL_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "model"),
)
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

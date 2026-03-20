FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch torchvision \
    && pip install --no-cache-dir flask flask-cors Pillow numpy

COPY backend/app.py backend/config.py ./backend/
COPY model/ ./model/

WORKDIR /app/backend

EXPOSE 8080

CMD ["python", "app.py"]

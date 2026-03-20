FROM node:20-alpine AS frontend-build

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN VITE_API_URL="" npm run build


FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch torchvision \
    && pip install --no-cache-dir flask flask-cors gunicorn Pillow numpy

WORKDIR /app
COPY backend/app.py backend/config.py ./backend/
COPY model/ ./model/

COPY --from=frontend-build /build/dist /usr/share/nginx/html
COPY hf-nginx.conf /etc/nginx/sites-enabled/default

ENV PORT=7860
ENV HOST=0.0.0.0
ENV MODEL_DIR=/app/model
ENV DEBUG=false

EXPOSE 7860

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]

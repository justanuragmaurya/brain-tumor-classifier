#!/bin/sh
cd /app/backend && PORT=8080 python app.py &
nginx -g "daemon off;"

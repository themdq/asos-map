# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================
# 2️⃣ Runtime stage (nginx)
# =========================
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback config with font MIME types
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(otf|ttf|woff|woff2)$ { \
        try_files $uri =404; \
        add_header Access-Control-Allow-Origin *; \
        add_header Cache-Control "public, max-age=31536000"; \
    } \
    \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml font/otf font/ttf font/woff font/woff2; \
    \
    types { \
        font/otf otf; \
        font/ttf ttf; \
        font/woff woff; \
        font/woff2 woff2; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

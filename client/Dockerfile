# -------------------
#  BUILD STAGE
# -------------------
FROM node:24-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------
#  PRODUCTION STAGE
# -------------------
FROM nginx:alpine-slim AS final

RUN addgroup -g 101 nginx 2>/dev/null || true && \
  adduser -u 101 -G nginx -D -H nginx 2>/dev/null || true

RUN mkdir -p /usr/share/nginx/html

RUN mkdir -p /var/cache/nginx/client_temp \
  /var/cache/nginx/proxy_temp \
  /var/cache/nginx/fastcgi_temp \
  /var/cache/nginx/uwsgi_temp \
  /var/cache/nginx/scgi_temp \
  && chown -R nginx:nginx /var/cache/nginx \
  && chmod -R 755 /var/cache/nginx

COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
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
FROM nginx:alpine-slim

RUN addgroup -g 1001 -S appgroup && \
  adduser -u 1001 -S appuser -G appgroup

COPY --from=build --chown=appuser:appgroup /app/dist /usr/share/nginx/html

USER appuser

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD [ "nginx", "-g", "daemon off;" ]
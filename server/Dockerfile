FROM node:24-slim

RUN addgroup --gid 1001 appgroup && \
  adduser --uid 1001 --gid 1001 --disabled-password --gecos "" appuser

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

CMD [ "npm", "start" ]
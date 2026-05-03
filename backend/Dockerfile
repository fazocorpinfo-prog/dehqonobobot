FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# ---------- runtime ----------
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
 && addgroup -S app && adduser -S app -G app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./dist/db/schema.sql

RUN mkdir -p /data && chown -R app:app /data /app

USER app

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/khatm.db

EXPOSE 3001

CMD ["node", "dist/index.js"]

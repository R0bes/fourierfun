# Root FourierFun app: webpack build + Express static server
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY webpack.config.js tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm run build

# Production image: only runtime deps + built assets
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY --from=builder /app/public ./public

EXPOSE 3001

USER node

CMD ["node", "server.js"]

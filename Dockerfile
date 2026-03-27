# FourierFun: Vite React app (modern-fourier) + Express static server
FROM node:20-alpine AS builder

WORKDIR /app

COPY modern-fourier/package.json modern-fourier/package-lock.json ./modern-fourier/
RUN cd modern-fourier && npm ci

COPY modern-fourier ./modern-fourier
RUN cd modern-fourier && npm run build

# Production image: only runtime deps + built assets
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY --from=builder /app/modern-fourier/dist ./public

EXPOSE 3001

USER node

CMD ["node", "server.js"]

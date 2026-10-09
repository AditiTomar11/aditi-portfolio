FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY vite.config.js ./
COPY client ./client
COPY shared ./shared
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-fund --no-audit && npm cache clean --force
COPY --chown=node:node server ./server
COPY --chown=node:node shared ./shared
COPY --from=builder --chown=node:node /app/client/dist ./client/dist
EXPOSE 3001
USER node
CMD ["npm", "start"]

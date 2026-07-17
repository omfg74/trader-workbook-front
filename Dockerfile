# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Host uses npm 11; alpine image ships npm 10 — align for lockfile compatibility
RUN npm install -g npm@11.6.0

COPY package.json package-lock.json ./
# Nested vite→esbuild@0.25 conflicts with Angular's esbuild@0.28 during postinstall.
# Install without scripts, drop nested copies, then install the single top-level binary.
RUN npm ci --ignore-scripts \
 && find node_modules -type d -path '*/vite/node_modules/esbuild' -prune -exec rm -rf {} + \
 && PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    node node_modules/esbuild/install.js

COPY . .
RUN npm run build -- --configuration=production

# Runtime: static SPA only — reverse proxy настраивается снаружи
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve@14
COPY --from=build /app/dist/trader-frontend/browser ./dist
EXPOSE 4200
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:4200"]

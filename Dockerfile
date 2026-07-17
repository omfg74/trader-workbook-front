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

# Runtime: nginx serves SPA and proxies /auth + /api to the backend
FROM nginx:1.27-alpine
RUN apk add --no-cache gettext
COPY --from=build /app/dist/trader-frontend/browser /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh \
 && rm -f /etc/nginx/conf.d/default.conf
EXPOSE 4200
ENV BACKEND_URL=http://host.docker.internal:8000
ENTRYPOINT ["/docker-entrypoint.sh"]

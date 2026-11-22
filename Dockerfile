# VARHub web image: the built PWA served by Caddy, which also proxies /api to the API container.
# Base images are pinned by digest; Dependabot proposes updates.
FROM node@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Branding is baked in at build time (a settings screen replaces this in roadmap R4).
ARG VITE_BRAND_NAME
ARG VITE_ORG_NAME
ARG VITE_TAGLINE
ARG VITE_SOURCE_URL
ENV VITE_BRAND_NAME=$VITE_BRAND_NAME VITE_ORG_NAME=$VITE_ORG_NAME VITE_TAGLINE=$VITE_TAGLINE VITE_SOURCE_URL=$VITE_SOURCE_URL
RUN npm run build

FROM caddy@sha256:4851e54a46b206517c574821bb5cc67f170d2156041e9fbc4c9193b45e84a75b
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80 443

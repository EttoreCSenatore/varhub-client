# VARHub web image: the built PWA served by Caddy, which also proxies /api to the API container.
# Base images are pinned by digest; Dependabot proposes updates.
FROM node@sha256:e18c3ccdf7d71619990b0e85639f506e2028a95410999cab24cc373cbd10e0ac AS build
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

FROM caddy@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80 443

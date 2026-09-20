# syntax=docker/dockerfile:1
#
# Generic Dockerfile for **every** TaskFlow frontend implementation.
# Select the implementation with the FRONTEND_DIR build arg, e.g.:
#
#   docker build -f docker/frontend.Dockerfile \
#     --build-arg FRONTEND_DIR=03-feature-sliced-design -t taskflow-fsd .

ARG FRONTEND_DIR=01-component-layered

# ---------------------------------------------------------------- build stage
# NOTE: the builder runs on glibc (Debian) on purpose. `npm ci` on Alpine hits
# npm/cli#4828 and refuses to install rollup's `*-linux-x64-musl` optional
# dependency, which breaks `vite build`. The build output is static files, so
# the builder's libc is irrelevant — only the runtime base image matters.
FROM node:22.22.2-bookworm-slim AS builder

ARG FRONTEND_DIR
WORKDIR /build

COPY frontend/${FRONTEND_DIR}/package.json frontend/${FRONTEND_DIR}/package-lock.json ./
RUN npm ci

COPY frontend/${FRONTEND_DIR}/ ./
RUN npm run build

# -------------------------------------------------------------- runtime stage
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

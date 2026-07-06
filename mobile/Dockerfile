# ─── Stage 1: Build Flutter Web ───────────────────────────────────────────────
FROM ubuntu:22.04 AS builder

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone Flutter at the exact version used in nixpacks.toml
ARG FLUTTER_VERSION=3.38.3
RUN git clone https://github.com/flutter/flutter.git \
      -b ${FLUTTER_VERSION} --depth 1 /flutter

ENV PATH="/flutter/bin:/flutter/bin/cache/dart-sdk/bin:$PATH"

# Pre-cache web toolchain (runs as root; suppress the warning)
RUN /flutter/bin/flutter config --no-analytics && \
    /flutter/bin/flutter precache --web

# Copy pubspec first for better layer caching
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./

RUN /flutter/bin/flutter pub get

# Copy the rest of the source and build
COPY . .
RUN /flutter/bin/flutter build web --release --base-href /

# ─── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:alpine

# Copy the built web assets
COPY --from=builder /app/build/web /usr/share/nginx/html

# Copy the nginx config that handles Railway's dynamic $PORT
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway injects $PORT at runtime; the entrypoint script substitutes it
EXPOSE 8080
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

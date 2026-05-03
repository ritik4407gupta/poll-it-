FROM nginx:1.27-alpine AS production

# Drop default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static site assets
WORKDIR /usr/share/nginx/html
COPY index.html ./
COPY styles.css ./
COPY manifest.json ./
COPY js ./js

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

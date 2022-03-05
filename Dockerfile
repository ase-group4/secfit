# Webserver running nginx
FROM nginx:perl

# Import port environment variable
ENV PORT=${PORT}

# Copy nginx config to the container
COPY nginx.conf /etc/nginx/nginx.conf
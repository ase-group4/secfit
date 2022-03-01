# Get docker image
FROM debian:buster-slim

# Import host environment variables
ARG DOMAIN
ARG URL_PREFIX
ARG PORT

# Set working dir
WORKDIR /app

# Transfer all our stuff to the builder
COPY . /app/

# Set the host variable in default.js (overwrite)
RUN echo "const HOST = '${URL_PREFIX}${DOMAIN}:${PORT}';" > ./www/scripts/defaults.js

# Install cordova
# Also install shelljs because of windows for some reason
RUN apt-get update -y && apt-get install npm -y && npm install -g cordova && npm install shelljs

# Run cordova app
CMD [ "cordova", "run", "browser", "--release", "--port=3000" ]

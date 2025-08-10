# Build a lightweight container for the RedPill Express proxy
FROM node:20-alpine

# Ensure prod-only install
ENV NODE_ENV=production

WORKDIR /app

# Install dependencies
COPY package*.json /app/
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY server.js /app/

# App listens on 5000 by default
EXPOSE 5000

CMD ["node", "server.js"]

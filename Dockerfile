FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

ENV NPM_CONFIG_FETCH_TIMEOUT=60000

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

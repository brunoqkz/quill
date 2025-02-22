FROM node:22.14.0-alpine AS base

# local dev
FROM base AS development
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["nodemon", "./bin/www"]

# prod image for prod deployment
FROM base AS production
WORKDIR /app

COPY package*.json ./

# clean install dependencies
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "./bin/www"]

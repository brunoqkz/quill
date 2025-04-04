FROM node:22.14.0-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS production
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview", "--", "--host"]

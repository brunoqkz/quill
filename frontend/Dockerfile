# Base Stage
FROM node:22.14.0-alpine AS base

WORKDIR /app
COPY package*.json ./

# Development Stage
FROM base AS development

RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Production Build Stage
FROM base AS build

RUN npm ci
COPY . .
RUN npm run build

# Production HTML Server
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
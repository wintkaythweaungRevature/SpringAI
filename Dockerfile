# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies needed for some packages
RUN apk add --no-cache bash git python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Build app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
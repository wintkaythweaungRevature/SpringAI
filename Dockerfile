# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

RUN apk add --no-cache bash git
COPY package*.json ./
# Install deps (legacy-peer-deps for older transitive peer ranges)
RUN npm install --legacy-peer-deps

COPY . .

# Build app - use react-scripts directly to skip postbuild (react-snap needs Chrome/Puppeteer, not in Alpine)
RUN CI=false npx react-scripts build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
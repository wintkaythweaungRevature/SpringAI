# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

RUN apk add --no-cache bash git
COPY package*.json ./
# ဒီစာကြောင်းကို အောက်ပါအတိုင်း ပြင်လိုက်ပါ
RUN npm install --legacy-peer-deps

COPY . .

# Build app - CI=false ထည့်တာက ပိုသေချာပါတယ်
RUN CI=false npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
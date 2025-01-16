# Stage 1: Build
# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
COPY .env ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Nginx
FROM nginx:alpine
WORKDIR /app
RUN rm /etc/nginx/conf.d/default.conf
COPY .nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

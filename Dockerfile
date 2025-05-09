# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app

# Cài Yarn trước (vì image Alpine thường không có sẵn)
# RUN corepack enable

COPY . .

# Cài dependencies bằng Yarn
# RUN yarn install
# RUN yarn build

RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4444

CMD ["nginx", "-g", "daemon off;"]

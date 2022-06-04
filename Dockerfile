FROM vlegm/dev-alpine:latest
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
RUN npm install -g ./
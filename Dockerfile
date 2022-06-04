FROM vlegm/dev-alpine:latest
WORKDIR /mnt/host
COPY . .
RUN yarn install
RUN yarn build
RUN npm install -g ./


FROM node:16 as build-stage

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY tsconfig.json .
COPY certs .
COPY types .
COPY public .
COPY src .

# RUN yarn build

# CMD [ "yarn", "start" ]

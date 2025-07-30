# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.11.0


FROM node:${NODE_VERSION}-alpine AS base


WORKDIR /app

COPY package*.json  .

RUN --mount=type=cache,target=/app/.npm \ 
    npm set cache /app/.npm && \
    npm install

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev" ]
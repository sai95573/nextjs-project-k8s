FROM node:18.17.0-alpine AS build-env
ADD . /app
WORKDIR /app
RUN npm install -f
RUN npm run build

FROM node:18.17.0-alpine
COPY --from=build-env /app /app
WORKDIR /app
EXPOSE 3000
CMD npm start
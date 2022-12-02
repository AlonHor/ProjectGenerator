FROM node:19.2.0-alpine3.15
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "open"]
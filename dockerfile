FROM node:current-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3638

CMD ["npm", "run", "dev"]
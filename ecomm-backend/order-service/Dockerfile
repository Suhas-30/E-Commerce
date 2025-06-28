FROM node:18

WORKDIR /app

COPY . .

COPY shared-utils ./shared-utils

RUN npm install

EXPOSE 3003

CMD ["node", "server.js"]



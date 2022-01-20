FROM node:14

WORKDIR /usr/app
COPY package*.json ./
RUN npm install 
COPY . .

#for typescript
RUN npm run build 
COPY ormconfig.json ./dist/
# COPY .env ./dist/
WORKDIR ./dist
EXPOSE 9001

CMD node index.js
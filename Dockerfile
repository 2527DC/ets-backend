FROM node:20-alpin
WORKDIR /app
COPY package.json/
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm" "start"]
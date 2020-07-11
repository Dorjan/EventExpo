FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
# RUN dpkg -i rabbitmq-server_3.8.5-1_all.deb

# RUN rm rabbitmq-server_3.8.5-1_all.deb
EXPOSE 3000 
CMD [ "node", "server.js" ]
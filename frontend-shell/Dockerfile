FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Add babel dependencies
RUN npm install @babel/core @babel/preset-env @babel/preset-react babel-loader style-loader css-loader

EXPOSE 3000

CMD ["npm", "run", "serve"]
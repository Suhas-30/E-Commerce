# Use official Node.js image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the source code (excluding node_modules)
COPY . .

# Expose the port your service runs on
EXPOSE 3001

# Run the app
CMD ["node", "server.js"]

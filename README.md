# 🛒 E-Commerce Microservice Project

This project is an online shopping platform built using a **microservice architecture**. It includes separate services for frontend and backend components, containerized using Docker.

## 📦 Clone the Repository

git clone https://github.com/Suhas-30/E-Commerce.git  
cd E-Commerce

## 💻 Running the Frontend

Navigate to the frontend directory, install dependencies, and start the development server:

cd frontend  
npm install  
npm run dev

The frontend will start on http://localhost:5173 (default Vite port).

## ⚙️ Running Backend Services

Make sure Docker is installed and running. Then, from the project root, run:

docker-compose up --build

This will spin up all the backend microservices defined in docker-compose.yml.

## 🧰 Requirements

- Node.js and npm
- Docker and Docker Compose

## 📁 Project Structure (Simplified)

E-Commerce/
├── frontend/             → ⚛️ React frontend
├── auth-service/         → 🔐 Authentication microservice (Login/Register, JWT)
├── product-service/      → 📦 Product management microservice
├── order-service/        → 🛒 Order processing microservice (Cart, Checkout)
├── ml-service/           → 🤖 BERT-based NoSQL Injection Detection (FastAPI)
├── ml-filter-gateway/    → 🧱 Middleware proxy to block malicious payloads
├── nginx/                → 🌐 API Gateway using NGINX (Routes internal services)
└── docker-compose.yml    → 🐳 Docker orchestration for all microservices
 

## 👥 Contributors

- [@Suhas-30](https://github.com/Suhas-30)
- [@Sushant-Khot](https://github.com/Sushant-Khot)
- [@Sunil2713](https://github.com/Sunil2713)
- [@keerthanasoms](https://github.com/keerthanasoms)

## 📬 Contact

Feel free to open issues or pull requests.  
GitHub: https://github.com/Suhas-30

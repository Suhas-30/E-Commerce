// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/product', // API Gateway path
  withCredentials: false // Set to true if using cookies/JWT
});

export default api;

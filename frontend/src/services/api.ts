import axios from 'axios';





// ExpenseSplit Pro API Service
// Handles all HTTP communication with .NET 8 Minimal API backend
// Includes request/response interceptors for error handling and toast notifications

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
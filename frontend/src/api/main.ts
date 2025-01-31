import { EplFantasy } from "./openapi/EplFantasy";

const getToken = () => {
  return document.cookie.split('jwt_token=')[1] || localStorage.getItem('jwt_token');
};

const api = new EplFantasy({
    BASE: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    HEADERS: {
      'Authorization': `Bearer ${getToken()}`,
      'Cookie': document.cookie,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    CREDENTIALS: 'include',
    WITH_CREDENTIALS: true
  }).default;

export default api;
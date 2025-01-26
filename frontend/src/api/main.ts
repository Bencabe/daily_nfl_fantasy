import { EplFantasy } from "./openapi/EplFantasy";

const api = new EplFantasy({
    BASE: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    HEADERS: {
      'Authorization': `Bearer ${document.cookie.split('jwt_token=')[1]}`,
      'Cookie': document.cookie,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    CREDENTIALS: 'include',
    WITH_CREDENTIALS: true
  }).default;

export default api;
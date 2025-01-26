
const config = {
    "host": import.meta.env.VITE_API_URL || 'http://localhost',
    "port": import.meta.env.VITE_API_PORT || 5001,
    "frontendHost": import.meta.env.VITE_FRONTEND_HOST || 'http://localhost:3000',
}

export default config
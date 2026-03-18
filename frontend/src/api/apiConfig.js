// Vite ya sabe si estás en modo 'development' o 'production'
const API_URL = import.meta.env.VITE_API_URL;

// Si por alguna razón la variable de entorno no carga, usamos un fallback
export const BASE_URL = API_URL || 'http://localhost:10000/api';

export default BASE_URL;
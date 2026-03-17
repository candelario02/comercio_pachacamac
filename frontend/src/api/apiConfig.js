// Detecta si estamos en entorno local
const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.'); // Para pruebas desde el celular en casa

// Configuración de URLs
export const BASE_URL = isLocalhost 
    ? 'http://localhost:10000/api'  // <--- Cambiado a 10000 para que coincida con tu backend
    : 'https://comercio-pachacamac-v2.onrender.com/api';

export default BASE_URL;
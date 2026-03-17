import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; // 1. Importamos la base inteligente

// 2. CAMBIO CLAVE: Ahora API_URL usa la BASE_URL. 
// Esto asegura que en tu PC use localhost y en la web use Render.
const API_URL = `${BASE_URL}/admin`; 

const getHeaders = () => ({ 
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
    } 
});

// Esta función ya queda protegida porque usa la constante API_URL de arriba
export const obtenerRubros = () => axios.get(`${API_URL}/rubros`, getHeaders());

// 3. CAMBIO IMPORTANTE: Aquí también aplicamos BASE_URL para la ruta pública
// Antes estaba fija en localhost:5000, ahora es dinámica.
export const obtenerRubrosPublicos = () => axios.get(`${BASE_URL}/publico/rubros`);

export const gestionarRubro = (data) => axios.post(`${API_URL}/gestionar-rubro`, data, getHeaders());
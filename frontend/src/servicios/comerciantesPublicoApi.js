import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; // 1. Importamos la base inteligente

// 2. CAMBIO CLAVE: Cambiamos la dirección fija por la dinámica.
// Ahora apuntará a /api/publico tanto en tu PC como en Render.
const API_URL = `${BASE_URL}/publico`;

export const obtenerSectores = async () => {
    // Al usar la variable API_URL, esta llamada ya es "todoterreno"
    const respuesta = await axios.get(`${API_URL}/sectores`);
    return respuesta.data;
};
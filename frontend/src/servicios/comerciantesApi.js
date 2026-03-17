import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; // 1. Importamos la base inteligente

// 2. CAMBIO CLAVE: Ya no usamos el texto fijo de localhost.
// Ahora la instancia usará la URL de tu PC o la de Render según corresponda.
const api = axios.create({
    baseURL: BASE_URL, 
});

// Mantenemos el Interceptor exactamente igual. 
// Es vital y seguirá inyectando el token en cada llamada a Render.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const ComercianteService = {
    /**
     * Obtiene la lista de solicitudes pendientes para el panel administrativo.
     */
    obtenerPendientes: async () => {
        // Al usar 'api.get', automáticamente se le pega la BASE_URL al inicio
        return await api.get('/admin/solicitudes-pendientes');
    },

    actualizarEstado: async (id, data) => {
        return await api.put(`/admin/solicitudes/${id}/estado`, data);
    },

    obtenerExpediente: async (comercianteId) => {
        return await api.get(`/admin/expediente/${comercianteId}`);
    }
};
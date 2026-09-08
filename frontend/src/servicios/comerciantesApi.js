import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; 
const api = axios.create({
    baseURL: BASE_URL, 
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const ComercianteService = {
   
    obtenerPendientes: async () => {
        return await api.get('/admin/solicitudes-pendientes');
    },

    actualizarEstado: async (id, data) => {
        return await api.put(`/admin/solicitudes/${id}/estado`, data);
    },

    obtenerExpediente: async (comercianteId) => {
        return await api.get(`/admin/expediente/${comercianteId}`);
    }
};
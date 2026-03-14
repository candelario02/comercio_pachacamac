import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Creamos una instancia de axios para reutilizar la configuración base
const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para inyectar el token automáticamente en cada petición
// Mantenemos esta lógica ya que es vital para la seguridad de tus endpoints administrativos
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
        return await api.get('/admin/solicitudes-pendientes');
    },

   
    actualizarEstado: async (id, data) => {
        return await api.put(`/admin/solicitudes/${id}/estado`, data);
    },

   
    obtenerExpediente: async (comercianteId) => {
        return await api.get(`/admin/expediente/${comercianteId}`);
    }
};
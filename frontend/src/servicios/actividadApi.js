import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const getHeaders = () => ({ 
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
    } 
});

export const obtenerActividades = () => axios.get(`${API_URL}/actividades`, getHeaders());

export const gestionarActividad = (payload) => axios.post(`${API_URL}/gestionar-actividad`, payload, getHeaders());
export const obtenerActividadesPublicas = () => axios.get('http://localhost:5000/api/publico/actividades');
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; 


const API_URL = `${BASE_URL}/admin`; 

const getHeaders = () => ({ 
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
    } 
});


export const obtenerActividades = () => axios.get(`${API_URL}/actividades`, getHeaders());

export const gestionarActividad = (payload) => axios.post(`${API_URL}/gestionar-actividad`, payload, getHeaders());


export const obtenerActividadesPublicas = () => axios.get(`${BASE_URL}/publico/actividades`);
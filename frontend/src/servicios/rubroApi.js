import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; 


const API_URL = `${BASE_URL}/admin`; 

const getHeaders = () => ({ 
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
    } 
});

export const obtenerRubros = () => axios.get(`${API_URL}/rubros`, getHeaders());

export const obtenerRubrosPublicos = () => axios.get(`${BASE_URL}/publico/rubros`);

export const gestionarRubro = (data) => axios.post(`${API_URL}/gestionar-rubro`, data, getHeaders());
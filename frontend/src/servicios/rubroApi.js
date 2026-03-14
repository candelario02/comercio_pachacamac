import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin'; 

const getHeaders = () => ({ 
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
    } 
});

export const obtenerRubros = () => axios.get(`${API_URL}/rubros`, getHeaders());


export const obtenerRubrosPublicos = () => axios.get('http://localhost:5000/api/publico/rubros');
export const gestionarRubro = (data) => axios.post(`${API_URL}/gestionar-rubro`, data, getHeaders());
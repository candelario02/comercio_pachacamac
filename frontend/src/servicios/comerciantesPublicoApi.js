import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';

const API_URL = `${BASE_URL}/publico`;

export const obtenerSectores = async () => {
    const respuesta = await axios.get(`${API_URL}/sectores`);
    return respuesta.data;
};
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';

const API_URL = `${BASE_URL}/auth`;

export const loginUsuario = async (correo, contrasena) => {
    // Esta función centraliza la llamada
    const respuesta = await axios.post(`${API_URL}/login`, { correo, contrasena });
    return respuesta.data;
};
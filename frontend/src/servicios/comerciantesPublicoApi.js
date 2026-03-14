import axios from 'axios';

const API_URL = 'http://localhost:5000/api/publico';

export const obtenerSectores = async () => {
    const respuesta = await axios.get(`${API_URL}/sectores`);
    return respuesta.data;
};
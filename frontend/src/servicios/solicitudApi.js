import axios from "axios";
import { BASE_URL } from '../api/apiConfig';
const API_URL = `${BASE_URL}/publico`;

export const registrarSolicitud = async (datos) => {
  try {
    const response = await axios.post(
      `${API_URL}/solicitar-licencia`,
      datos
    );

    return response.data;

  } catch (error) {
    console.error(
      "Error en registrarSolicitud API:",
      error.response?.data || error.message
    );

    throw error;
  }
};
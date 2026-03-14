import axios from "axios";

const API_URL = "http://localhost:5000/api/publico";

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
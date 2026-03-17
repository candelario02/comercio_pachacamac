import axios from "axios";
import { BASE_URL } from '../api/apiConfig'; // 1. Importamos la base inteligente

// 2. CAMBIO CLAVE: Quitamos la URL fija de localhost.
// Ahora apuntará a /api/publico en tu PC o en Render automáticamente.
const API_URL = `${BASE_URL}/publico`;

export const registrarSolicitud = async (datos) => {
  try {
    // 3. La llamada ahora usa la variable dinámica
    const response = await axios.post(
      `${API_URL}/solicitar-licencia`,
      datos
    );

    return response.data;

  } catch (error) {
    // Mantenemos tu lógica de errores intacta para que sepas qué falló
    console.error(
      "Error en registrarSolicitud API:",
      error.response?.data || error.message
    );

    throw error;
  }
};
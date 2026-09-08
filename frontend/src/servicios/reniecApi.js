import axios from "axios";
import { BASE_URL } from "../api/apiConfig";

const API_URL = `${BASE_URL}/publico`;

export const consultarDniReniec = async (dni) => {
  try {
    const respuesta = await axios.get(`${API_URL}/reniec/dni/${dni}`);
    return respuesta.data;
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || "Error al consultar DNI";
    throw new Error(mensaje);
  }
};

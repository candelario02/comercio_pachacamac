import axios from "axios";
import { BASE_URL } from "../api/apiConfig";

const api = axios.create({
  baseURL: `${BASE_URL}/admin`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const AdminServicio = {
  aprobarTramiteYGenerarDeuda: async (id, token, datosPago) => {
    const res = await api.put(`/aprobar-tramite/${id}`, datosPago, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  obtenerPagosPendientes: async (token) => {
    const res = await api.get("/pagos-pendientes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  confirmarPago: async (id, token, datos = {}) => {
    const res = await api.put(`/confirmar-pago/${id}`, datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  obtenerFormalizados: async (token, buscar = "") => {
    const url = buscar ? `/formalizados?buscar=${buscar}` : "/formalizados";
    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  exportarExcel: (token, buscar = "", mes = "", anio = "") => {
    const url = `${api.defaults.baseURL}/formalizados/exportar?buscar=${buscar}&mes=${mes}&anio=${anio}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlBlob;
        a.download = `Reporte_${mes || "Anual"}_${anio || ""}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(urlBlob);
      });
  },

  validarQRPublico: async (dni, tipo) => {
    const res = await api.get(`/publico/validar/${dni}?tipo=${tipo}`);
    return res.data;
  },

  obtenerEstadisticasGraficos: async (token) => {
    const res = await api.get("/estadisticas-graficos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  actualizarEstadoTramite: async (id, token, datos) => {
    const res = await api.put(`/solicitudes/${id}/estado`, datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

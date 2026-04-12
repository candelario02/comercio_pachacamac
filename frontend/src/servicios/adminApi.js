import { BASE_URL } from "../api/apiConfig";

const API_URL = `${BASE_URL}/admin`;

export const AdminServicio = {
  aprobarTramiteYGenerarDeuda: async (id, token, datosPago) => {
    const res = await fetch(`${API_URL}/aprobar-tramite/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPago),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.mensaje || "Error al aprobar trámite y generar deuda",
      );
    }

    return await res.json();
  },

  obtenerPagosPendientes: async (token) => {
    const res = await fetch(`${API_URL}/pagos-pendientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Error al conectar con el servidor de pagos");
    return await res.json();
  },

  confirmarPago: async (id, token, datos = {}) => {
    const res = await fetch(`${API_URL}/confirmar-pago/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || "Error al confirmar pago");
    }

    return await res.json();
  },

  obtenerFormalizados: async (token, buscar = "") => {
    const url = buscar
      ? `${API_URL}/formalizados?buscar=${buscar}`
      : `${API_URL}/formalizados`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Error al obtener lista de formalizados");
    return await res.json();
  },

  exportarExcel: (token, buscar = "", mes = "", anio = "") => {
    const url = `${API_URL}/formalizados/exportar?buscar=${buscar}&mes=${mes}&anio=${anio}`;

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
      });
  },

  validarQRPublico: async (dni, tipo) => {
    const res = await fetch(`${API_URL}/publico/validar/${dni}?tipo=${tipo}`);
    if (!res.ok) throw new Error("Credencial no encontrada");
    return { data: await res.json() };
  },

  obtenerEstadisticasGraficos: async (token) => {
    const res = await fetch(`${API_URL}/estadisticas-graficos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Error al obtener datos para los gráficos");
    }

    return await res.json();
  },

  actualizarEstadoTramite: async (id, token, datos) => {
    const respuesta = await fetch(`${API_URL}/solicitudes/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      throw new Error(
        errorData.mensaje || "Error en la comunicación con el servidor",
      );
    }

    return await respuesta.json();
  },
};

import { BASE_URL } from '../api/apiConfig'; // 1. Mantenemos el import

// 2. CAMBIO CLAVE: Ahora API_URL es dinámica. 
// Si estás en PC es localhost, si estás en la web es Render.
const API_URL = `${BASE_URL}/admin`; 

export const AdminServicio = {
    
    aprobarTramiteYGenerarDeuda: async (id, token, datosPago) => {
        // Aquí se usa la nueva API_URL dinámica automáticamente
        const res = await fetch(`${API_URL}/aprobar-tramite/${id}`, {
            method: 'PUT', 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datosPago) 
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.mensaje || 'Error al aprobar trámite y generar deuda');
        }
        
        return await res.json();
    },

    obtenerPagosPendientes: async (token) => {
        const res = await fetch(`${API_URL}/pagos-pendientes`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Error al conectar con el servidor de pagos');
        return await res.json();
    },


confirmarPago: async (id, token, datos = {}) => {
    const res = await fetch(`${API_URL}/confirmar-pago/${id}`, { 
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(datos) 
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.mensaje || 'Error al confirmar pago');
    }
    
    return await res.json();
},



   obtenerFormalizados: async (token, buscar = "") => { 
    const url = buscar 
        ? `${API_URL}/formalizados?buscar=${buscar}` 
        : `${API_URL}/formalizados`;

    const res = await fetch(url, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Error al obtener lista de formalizados');
    return await res.json();
}
};
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

// adminApi.js
confirmarPago: async (id, token, datos = {}) => {
    // IMPORTANTE: Asegúrate de que la URL en el backend sea exactamente esta.
    // Si tu backend usa prefijos como /admin, agrégalo aquí.
    const res = await fetch(`${API_URL}/admin/confirmar-pago/${id}`, { 
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        // Aquí viajan: vigencia_comercio, vigencia_sanidad, etc.
        body: JSON.stringify(datos) 
    });
    
    if (!res.ok) {
        // Capturamos el error que viene del catch (ROLLBACK) del backend
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.mensaje || 'Error al confirmar pago');
    }
    
    return await res.json();
},



    obtenerFormalizados: async (token) => {
        const res = await fetch(`${API_URL}/formalizados`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Error al obtener lista de formalizados');
        return await res.json();
    }
};
const API_URL = 'http://localhost:5000/api/admin'; 

export const AdminServicio = {
   
   aprobarTramiteYGenerarDeuda: async (id, token, datosPago) => {
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

    confirmarPago: async (id, token) => {
        const res = await fetch(`${API_URL}/confirmar-pago/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.mensaje || 'Error al confirmar pago y formalizar');
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

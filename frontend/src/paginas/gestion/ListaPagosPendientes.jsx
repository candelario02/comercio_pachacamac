import React, { useEffect, useState } from 'react';
import { FaSync, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import '../../estilos/gestion-expedientes.css'; 
import { AdminServicio } from '../../servicios/adminApi';

const ListaPagosPendientes = () => {
    const [pagos, setPagos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => { 
        cargarPagos(); 
    }, []);

    const cargarPagos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const res = await AdminServicio.obtenerPagosPendientes(token);
            
            if (res && res.data && Array.isArray(res.data)) {
                setPagos(res.data);
            } else {
                setPagos([]);
            }
        } catch (err) {
            console.error("Error al cargar pagos:", err);
            setPagos([]);
        } finally {
            setCargando(false);
        }
    };

    const handleConfirmarPago = async (s) => {
        const esValidoParaConfirmar = s.id_pago && (parseFloat(s.monto_pagado) > 0 || s.exento_pago === true);

        if (!esValidoParaConfirmar) {
            alert("⚠️ No se puede confirmar: El trámite no tiene un pago registrado o no es un caso de exoneración válido.");
            return;
        }

        const mensajeConfirmar = s.exento_pago 
            ? "¿Está seguro de formalizar este trámite EXONERADO?" 
            : "¿Está seguro de confirmar este pago? Esta acción lo validará en el sistema.";
            
        const confirmar = window.confirm(mensajeConfirmar);
        if (!confirmar) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
                return;
            }

            const respuesta = await AdminServicio.confirmarPago(s.id_pago, token);

            if (respuesta.success) {
                alert(s.exento_pago ? '✅ ¡Trámite formalizado con éxito!' : '✅ ¡Pago confirmado con éxito!');
                await cargarPagos(); 
            } else {
                alert('Hubo un problema: ' + (respuesta.mensaje || 'Error desconocido'));
            }
        } catch (error) {
            console.error("Error crítico al confirmar:", error);
            alert('❌ Error de conexión: No se pudo comunicar con el servidor.');
        }
    };

    return (
        <div className="gestion-contenedor">
            <header className="gestion-header-pro">
                <h2>Pagos Pendientes</h2>
                <button 
                    onClick={cargarPagos} 
                    className="btn-actualizar-circular"
                    disabled={cargando}
                >
                    <FaSync className={cargando ? 'spin' : ''} />
                </button>
            </header>

            <div className="tabla-card">
                <table className="tabla-gestion">
                    <thead>
                        <tr>
                            <th>DNI</th>
                            <th>Comerciante</th>
                            <th>Monto</th>
                            <th>Operación</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagos.length > 0 ? (
                            pagos.map((s) => (
                                <tr key={s.id_pago}> 
                                    <td>{s.dni}</td>
                                    <td>{s.nombres} {s.apellidos}</td>
                                    <td>S/ {s.monto_pagado}</td>
                                    <td>{s.numero_operacion}</td>
                                    <td>
                                        <span className="status-label">
                                            <FaDollarSign /> Por Cobrar
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-aprobar" 
                                            onClick={() => handleConfirmarPago(s)}
                                        >
                                            <FaCheckCircle /> Confirmar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    {cargando ? "Cargando datos..." : "No se encontraron pagos pendientes."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListaPagosPendientes;
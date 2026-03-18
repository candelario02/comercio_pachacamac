import React, { useEffect, useState } from 'react';
import { FaSync, FaDollarSign, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../../estilos/gestion-expedientes.css'; 
import { AdminServicio } from '../../servicios/adminApi';
import ModalAlerta from '../../componentes/comunes/ModalAlerta';

const ListaPagosPendientes = () => {
    const [pagos, setPagos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAlerta, setModalAlerta] = useState({ abierto: false, mensaje: '', tipo: '', accion: null });

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

    const handleConfirmarPago = (s) => {
        // Validación: debe tener ID y (monto > 0 o ser exonerado)
        const montoValido = parseFloat(s.monto_pagado) > 0 || s.exento_pago;
        
        if (!s.id_pago || !montoValido) {
            setModalAlerta({
                abierto: true,
                mensaje: `⚠️ Error: Los datos de pago para ${s.nombres} están incompletos o el monto es S/ 0.00.`,
                tipo: "aceptar",
                accion: null
            });
            return;
        }

        setModalAlerta({
            abierto: true,
            mensaje: s.exento_pago 
                ? `¿Está seguro de formalizar el trámite EXONERADO de ${s.nombres} ${s.apellidos}?` 
                : `¿Validar pago de S/ ${s.monto_pagado} para ${s.nombres}?`,
            tipo: "confirmar",
            accion: () => ejecutarConfirmacion(s)
        });
    };

    const ejecutarConfirmacion = async (s) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Preparamos los datos adicionales para la API
            const datosConfirmacion = {
                monto_final: s.monto_pagado,
                dni_comerciante: s.dni,
                es_exonerado: s.exento_pago
            };

            // Llamada única a la API con el cuerpo de datos
            const respuesta = await AdminServicio.confirmarPago(s.id_pago, token, datosConfirmacion);

            if (respuesta.success) {
                setModalAlerta({
                    abierto: true,
                    mensaje: '✅ ¡Operación exitosa! El comerciante ha sido formalizado.',
                    tipo: "aceptar",
                    accion: () => cargarPagos() 
                });
            } else {
                setModalAlerta({
                    abierto: true,
                    mensaje: '❌ Error: ' + (respuesta.mensaje || 'No se pudo procesar el pago.'),
                    tipo: "aceptar"
                });
            }
        } catch (error) {
            console.error("Error crítico al confirmar:", error);
            setModalAlerta({
                abierto: true,
                mensaje: '❌ Error de conexión con el servidor.',
                tipo: "aceptar"
            });
        }
    };

    return (
        <div className="gestion-contenedor">
            {/* Componente de Alerta Personalizado */}
            <div className="modal-alerta-overlay" style={{ display: modalAlerta.abierto ? 'flex' : 'none' }}>
                <ModalAlerta 
                    modal={modalAlerta} 
                    cerrar={() => setModalAlerta({...modalAlerta, abierto: false})} 
                />
            </div>

            <header className="gestion-header-pro">
                <h2>Validación de Pagos</h2>
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
                            <th>Monto Recibido</th>
                            <th>N° Operación</th>
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
                                    <td>
                                        <strong className="monto-resaltado">
                                            S/ {parseFloat(s.monto_pagado || 0).toFixed(2)}
                                        </strong>
                                    </td>
                                    <td>
                                        <span className="badge-operacion">
                                            {s.numero_operacion || (s.exento_pago ? 'EXONERADO' : '---')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-label ${s.exento_pago ? 'exento' : 'pendiente-pago'}`}>
                                            {s.exento_pago ? <FaCheckCircle /> : <FaDollarSign />} 
                                            {s.exento_pago ? "Exonerado" : "Pago x Validar"}
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
                                <td colSpan="6" className="celda-vacia">
                                    {cargando ? (
                                        <div className="loading-container">
                                            <FaSync className="spin" /> Procesando...
                                        </div>
                                    ) : (
                                        <div className="vacio-box">
                                            <FaExclamationTriangle className="icon-vacio" />
                                            <p>No hay pagos pendientes de revisión en este momento.</p>
                                        </div>
                                    )}
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
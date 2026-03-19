import React, { useEffect, useState } from 'react';
import { FaSync, FaDollarSign, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa'; // Añadimos FaEye
import '../../estilos/gestion-expedientes.css'; 
import { AdminServicio } from '../../servicios/adminApi';
import { BASE_URL } from '../../api/apiConfig'; // Importamos la URL base para las fotos
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

    // Función para abrir el comprobante en otra pestaña
    const verComprobante = (rutaArchivo) => {
        if (!rutaArchivo) {
            alert("No hay archivo adjunto para este pago.");
            return;
        }
        // Construimos la URL: BASE_URL + ruta guardada en DB
        const url = `${BASE_URL}/${rutaArchivo}`;
        window.open(url, '_blank');
    };

    const handleConfirmarPago = (s) => {
        const montoValido = parseFloat(s.monto_pagado) > 0 || s.exento_pago;
        
        if (!s.id_pago || !montoValido) {
            setModalAlerta({
                abierto: true,
                mensaje: `⚠️ Error: Los datos de pago para ${s.nombres} están incompletos.`,
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

            const datosConfirmacion = {
                monto_final: s.monto_pagado,
                dni_comerciante: s.dni,
                es_exonerado: s.exento_pago
            };

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
                    mensaje: '❌ Error: ' + (respuesta.mensaje || 'No se pudo procesar.'),
                    tipo: "aceptar"
                });
            }
        } catch (error) {
            console.error("Error crítico:", error);
            setModalAlerta({ abierto: true, mensaje: '❌ Error de conexión.', tipo: "aceptar" });
        }
    };

    return (
        <div className="gestion-contenedor">
            <div className="modal-alerta-overlay" style={{ display: modalAlerta.abierto ? 'flex' : 'none' }}>
                <ModalAlerta 
                    modal={modalAlerta} 
                    cerrar={() => setModalAlerta({...modalAlerta, abierto: false})} 
                />
            </div>

            <header className="gestion-header-pro">
                <h2>Validación de Pagos Pendientes</h2>
                <button onClick={cargarPagos} className="btn-actualizar-circular" disabled={cargando}>
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
                            <th>N° Operación</th>
                            <th>Voucher</th> {/* Nueva Columna */}
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagos.length > 0 ? (
                            pagos.map((s) => (
                                <tr key={s.id_pago}> 
                                    <td>{s.dni}</td>
                                    <td>{s.nombres} {s.apellidos}</td>
                                    <td><strong>S/ {parseFloat(s.monto_pagado || 0).toFixed(2)}</strong></td>
                                    <td><span className="badge-operacion">{s.numero_operacion || '---'}</span></td>
                                    
                                    {/* BOTÓN PARA VER EL ARCHIVO */}
                                    <td>
                                        <button 
                                            className="btn-ver-voucher"
                                            onClick={() => verComprobante(s.ruta_voucher)}
                                            title="Ver documento adjunto"
                                        >
                                            <FaEye /> Ver Foto
                                        </button>
                                    </td>

                                    <td>
                                        <button className="btn-aprobar" onClick={() => handleConfirmarPago(s)}>
                                            <FaCheckCircle /> Confirmar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="celda-vacia">
                                    {cargando ? "Cargando..." : "No hay pagos pendientes."}
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
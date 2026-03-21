import React, { useEffect, useState } from 'react';
import { FaSync, FaCheckCircle, FaEye, FaCalendarAlt } from 'react-icons/fa'; 
import '../../estilos/gestion-expedientes.css'; 
import { AdminServicio } from '../../servicios/adminApi';
import { BASE_URL } from '../../api/apiConfig'; 
import ModalAlerta from '../../componentes/comunes/ModalAlerta';

const ListaPagosPendientes = () => {
    const [pagos, setPagos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAlerta, setModalAlerta] = useState({ abierto: false, mensaje: '', tipo: '', accion: null });
    
    const [mesesComercio, setMesesComercio] = useState(6);
    const [mesesSanidad, setMesesSanidad] = useState(12);

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
            } else { setPagos([]); }
        } catch (err) {
            console.error("Error al cargar pagos:", err);
            setPagos([]);
        } finally { setCargando(false); }
    };

    const verComprobante = (nombreArchivo) => {
        if (!nombreArchivo) {
            alert("No hay archivo adjunto para este pago.");
            return;
        }
        const servidorRaiz = BASE_URL.endsWith('/api') 
            ? BASE_URL.replace('/api', '') 
            : BASE_URL;
        const urlFinal = `${servidorRaiz}/uploads/vouchers/${nombreArchivo}`;
        window.open(urlFinal, '_blank');
    };

    const handleConfirmarPago = (s) => {
        const montoValido = parseFloat(s.monto_pagado) > 0 || s.exento_pago;
        if (!s.id_pago || !montoValido) {
            setModalAlerta({
                abierto: true,
                mensaje: `⚠️ Error: Datos incompletos para ${s.nombres}.`,
                tipo: "aceptar",
                accion: null
            });
            return;
        }

        setModalAlerta({
            abierto: true,
            mensaje: (
                <div className="modal-vigencia-control">
                    <p>¿Validar formalización para <strong>{s.nombres}</strong>?</p>
                    <hr />
                    <div className="info-grid" style={{marginTop: '10px'}}>
                        <div className="input-field">
                            <label style={{display: 'block', fontSize: '0.8rem'}}><FaCalendarAlt /> Meses Comercio:</label>
                            <input 
                                type="number" 
                                className="input-standard"
                                defaultValue={6} 
                                onChange={(e) => setMesesComercio(parseInt(e.target.value))}
                                min="1" max="60"
                            />
                        </div>
                        <div className="input-field">
                            <label style={{display: 'block', fontSize: '0.8rem'}}><FaCalendarAlt /> Meses Sanidad:</label>
                            <input 
                                type="number" 
                                className="input-standard"
                                defaultValue={12} 
                                onChange={(e) => setMesesSanidad(parseInt(e.target.value))}
                                min="1" max="60"
                            />
                        </div>
                    </div>
                </div>
            ),
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
                es_exonerado: s.exento_pago,
                vigencia_comercio: mesesComercio,
                vigencia_sanidad: mesesSanidad    
            };
            const respuesta = await AdminServicio.confirmarPago(s.id_pago, token, datosConfirmacion);
            if (respuesta.success) {
                setModalAlerta({
                    abierto: true,
                    mensaje: '✅ ¡Operación exitosa! Carnets generados con la vigencia indicada.',
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
            {modalAlerta.abierto && (
                <div className="modal-alerta-overlay">
                    <ModalAlerta 
                        modal={modalAlerta} 
                        cerrar={() => setModalAlerta({...modalAlerta, abierto: false})} 
                    />
                </div>
            )}

            <header className="gestion-header-pro">
                <h2>Validación de Pagos</h2>
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
                            <th>Voucher</th>
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
                                    <td>
                                        <button 
                                            className="btn-ver-foto" 
                                            onClick={() => verComprobante(s.voucher_url)}
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
                                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
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
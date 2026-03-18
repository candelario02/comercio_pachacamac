import React, { useEffect, useState } from 'react';
import { ComercianteService } from '../../servicios/comerciantesApi';
import { AdminServicio } from '../../servicios/adminApi';
import { generarOrdenPagoPDF } from '../../herramientas/generadorDocumentos';
import { 
    FaFileInvoiceDollar, FaCheck, FaEye, 
    FaSync, FaIdCard 
} from 'react-icons/fa';
import ModalAlerta from '../../componentes/comunes/ModalAlerta';
import '../../estilos/gestion-expedientes.css';

const ListaPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState(null);
    const [modalAlerta, setModalAlerta] = useState({ abierto: false, mensaje: '', tipo: '', accion: null });
    
    const [montoActividad, setMontoActividad] = useState(0);
    const [montoCarnet, setMontoCarnet] = useState(25);
    const [incluirCarnet, setIncluirCarnet] = useState(false);

    useEffect(() => { cargarSolicitudes(); }, []);

    const cargarSolicitudes = async () => {
        try {
            setCargando(true);
            const res = await ComercianteService.obtenerPendientes();
            const datosProcesados = Array.isArray(res.data) ? res.data.map(item => ({
                ...item,
                telefono: item.telefono || '---',
                distrito: item.sector_nombre || 'No especificado'
            })) : [];
            setSolicitudes(datosProcesados);
        } catch (err) { console.error("Error al cargar:", err); }
        finally { setCargando(false); }
    };

    const abrirDetalle = (s) => {
        setSeleccionado(s);
        setMontoActividad(parseFloat(s.costo_actividad) || 60);
        setIncluirCarnet(s.desea_tramitar_carnet === true || s.desea_tramitar_carnet === 'true');
        setModalAbierto(true);
    };

    const totalFinal = (parseFloat(montoActividad) || 0) + (incluirCarnet ? (parseFloat(montoCarnet) || 0) : 0);

    const prepararAprobacion = (id) => {
    // 1. Aseguramos que los valores sean números antes de sumar
    const mActividad = parseFloat(montoActividad) || 0;
    const mCarnet = incluirCarnet ? (parseFloat(montoCarnet) || 0) : 0;
    const montoFinalCalculado = mActividad + mCarnet;

    setModalAlerta({
        abierto: true,
        mensaje: `¿Aprobar trámite? Se generará una orden por S/ ${montoFinalCalculado.toFixed(2)}`,
        tipo: "confirmar",
        accion: async () => {
            try {
                const token = localStorage.getItem('token');
                
                // 2. Enviamos números limpios al backend
                const datosPago = { 
                    monto_confirmado: montoFinalCalculado, 
                    detalle: { 
                        actividad: mActividad, 
                        carnet: mCarnet 
                    } 
                };

                const res = await AdminServicio.aprobarTramiteYGenerarDeuda(id, token, datosPago);
                
                if (res.success) {
                    setModalAlerta({
                        abierto: true,
                        mensaje: `✅ ¡Éxito! Orden generada por S/ ${montoFinalCalculado.toFixed(2)}`,
                        tipo: "aceptar",
                        accion: () => {
                            // 3. Limpiamos estados para la siguiente operación
                            setModalAbierto(false);
                            setModalAlerta({ abierto: false, mensaje: '', tipo: '', accion: null });
                            cargarSolicitudes();
                        }
                    });
                } else {
                    // Manejo de error si el backend responde success: false
                    alert(res.mensaje || "Error al procesar la aprobación");
                }
            } catch (error) {
                console.error("Error al aprobar:", error);
                alert("Error de conexión con el servidor");
            }
        }
    });
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
                <h2>Expedientes Pendientes</h2>
                <button onClick={cargarSolicitudes} className="btn-actualizar-circular">
                    <FaSync className={cargando ? 'spin' : ''} />
                </button>
            </header>

            <div className="tabla-card">
    <table className="tabla-gestion">
        <thead>
            <tr>
                <th>DNI/RUC</th>
                <th>Comerciante</th>
                <th>Teléfono</th> 
                <th>Sector/Distrito</th>
                <th>Actividad</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {solicitudes.map((s) => (
                <tr key={s.comerciante_id}>
                    <td>{s.dni}</td>                    
                    <td>{s.nombres} {s.apellidos}</td>
                    <td>{s.celular || 'Sin número'}</td>
                    <td>{s.distrito}</td>
                    <td>{s.actividad_nombre}</td>
                    <td>
                        <button className="btn-footer" onClick={() => abrirDetalle(s)}>
                            <FaEye /> Detalle
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

            {modalAbierto && seleccionado && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <div className="modal-header">
                            <h3><FaIdCard /> Detalle: {seleccionado.nombres}</h3>
                        </div>
                        
                        <div className="modal-body">
                            <div className="detalle-seccion">
                                <h4>Información del Comerciante</h4>
               <div className="info-grid">
    <p><strong>Nombres:</strong> {seleccionado.nombres} {seleccionado.apellidos}</p>
    <p><strong>DNI/RUC:</strong> {seleccionado.dni}</p>
    <p><strong>Teléfono:</strong> {seleccionado.celular || seleccionado.numero_celular || 'S/N'}</p>
    <p><strong>Sector:</strong> {seleccionado.sector_nombre || seleccionado.distrito}</p>
    <p><strong>Ubicación:</strong> 
        Lat: {seleccionado.lat || seleccionado.latitud_puesto} | 
        Lng: {seleccionado.lng || seleccionado.longitud_puesto}
    </p>
</div>
                            </div>

                            <div className="detalle-seccion">
                                <h4>Liquidación de Pago</h4>
                                <div className="input-group">
                                    <label>Derecho Trámite (S/): 
                                        <input type="number" value={montoActividad} onChange={(e) => setMontoActividad(e.target.value)} />
                                    </label>
                                    <label>
                                        <input type="checkbox" checked={incluirCarnet} onChange={(e) => setIncluirCarnet(e.target.checked)} /> 
                                        Incluir Carnet (S/): 
                                        <input type="number" value={montoCarnet} disabled={!incluirCarnet} onChange={(e) => setMontoCarnet(e.target.value)} />
                                    </label>
                                </div>
                                <div className="total-display"><strong>Total: S/ {totalFinal.toFixed(2)}</strong></div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-footer" onClick={() => setModalAbierto(false)}>Cerrar</button>
                            <button className="btn-orden-pago" onClick={async () => await generarOrdenPagoPDF(seleccionado, {total: totalFinal, derecho: montoActividad, carnet: incluirCarnet ? montoCarnet : 0})}>
                                <FaFileInvoiceDollar /> Generar Orden
                            </button>
                            <button className="btn-aprobar" onClick={() => prepararAprobacion(seleccionado.comerciante_id)}>
                                <FaCheck /> Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaPendientes;
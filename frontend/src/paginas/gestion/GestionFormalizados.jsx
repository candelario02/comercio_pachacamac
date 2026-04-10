import React, { useState, useEffect } from 'react';
import { AdminServicio } from '../../servicios/adminApi';
// IMPORTANTE: Se agregó FaFileExcel a la lista de iconos
import { FaSync, FaMedkit, FaStore, FaSearch, FaFileExcel } from 'react-icons/fa'; 
import { generarCarnetPDF } from '../../herramientas/generadorDocumentos'; 
import '../../estilos/gestion-expedientes.css';

const GestionFormalizados = () => {
    const [formalizados, setFormalizados] = useState([]);
    const [filtro, setFiltro] = useState(""); 
    const [cargando, setCargando] = useState(true);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

    const manejarExportarExcel = () => {
        const token = localStorage.getItem('token');
        // Enviamos el filtro del buscador, el mes y el año
        AdminServicio.exportarExcel(token, filtro, mesSeleccionado, anioSeleccionado);
    };

    const cargarFormalizados = async (dniABuscar = "") => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const res = await AdminServicio.obtenerFormalizados(token, dniABuscar);
            setFormalizados(res.data || []);
        } catch (err) {
            console.error("Error al cargar formalizados:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            cargarFormalizados(filtro);
        }, 500);
        return () => clearTimeout(timer);
    }, [filtro]);

    const obtenerEstadoVencimiento = (fecha) => {
        if (!fecha) return "fecha-pendiente";
        const hoy = new Date();
        const vencimiento = new Date(fecha);
        const difDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

        if (difDias < 0) return "fecha-vencida";
        if (difDias <= 30) return "fecha-proxima";
        return "fecha-vigente";
    };

    return (
        <div className="gestion-contenedor">
           <header className="gestion-header-pro">
    <h2>Control de Formalizados</h2>
    <div className="header-acciones">
        <div className="buscador-caja">
            <FaSearch className="icon-search" />
            <input 
                type="text" 
                className="buscador-input" 
                placeholder="Ingrese DNI para buscar..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />
        </div>

        <select 
            className="buscador-input select-mes" 
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
        >
            <option value="">Mes (Todos)</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
        </select>
        <select 
            className="buscador-input" 
            style={{ width: '100px' }}
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
        >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
        </select>
        <button 
            onClick={manejarExportarExcel} 
            className="btn-excel-formalizados" 
            title="Exportar a Excel"
        >
            <FaFileExcel />
            <span>Excel</span>
        </button>
        <button onClick={() => cargarFormalizados(filtro)} className="btn-actualizar-circular">
            <FaSync className={cargando ? 'spin' : ''} />
        </button>
    </div>
</header>

            <div className="tabla-card">
                <table className="tabla-gestion">
                    <thead>
                        <tr>
                            <th>Expediente</th>
                            <th>DNI</th>
                            <th>Comerciante</th>
                            <th>Vencimiento</th>
                            <th>Emisión de Documentos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formalizados.length > 0 ? (
                            formalizados.map((item) => (
                                <tr key={item.comerciante_id}>
                                    <td>{item.numero_expediente}</td>
                                    <td>{item.dni}</td>
                                    <td className="comerciante-nombre">
                                        {(`${item.nombres} ${item.apellidos}`).toLowerCase()}
                                    </td>
                                    <td>
                                        <span className={`fecha-badge ${obtenerEstadoVencimiento(item.fecha_vencimiento)}`}>
                                            {item.fecha_vencimiento 
                                                ? new Date(item.fecha_vencimiento).toLocaleDateString('es-PE') 
                                                : 'Sin fecha'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-botones-flex">
                                            <button 
                                                className="btn-emitir carnet-comercio"
                                                onClick={() => generarCarnetPDF(item, 'comercio')}
                                            >
                                                <FaStore /> Comercio
                                            </button>

                                            {item.desea_tramitar_carnet && (
                                                <button 
                                                    className="btn-emitir carnet-sanidad" 
                                                    onClick={() => generarCarnetPDF(item, 'sanidad')}
                                                >
                                                    <FaMedkit /> Sanidad
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4"  className="tabla-mensaje-estado">
                                    {cargando ? "Buscando..." : "DNI no encontrado."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionFormalizados;
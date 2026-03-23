import React, { useState, useEffect } from 'react';
import { AdminServicio } from '../../servicios/adminApi';
import { FaSync, FaMedkit, FaStore, FaSearch } from 'react-icons/fa'; 
import { generarCarnetPDF } from '../../herramientas/generadorDocumentos'; 
import '../../estilos/gestion-expedientes.css';

const GestionFormalizados = () => {
    const [formalizados, setFormalizados] = useState([]);
    const [filtro, setFiltro] = useState(""); 
    const [cargando, setCargando] = useState(true);

    const cargarFormalizados = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const res = await AdminServicio.obtenerFormalizados(token);
            setFormalizados(res.data || []);
        } catch (err) {
            console.error("Error al cargar formalizados:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { 
        cargarFormalizados(); 
    }, []);

    // 1. LÓGICA DE BÚSQUEDA BLINDADA
    // Usamos variables auxiliares para evitar errores si DNI o nombres son null
    const datosFiltrados = formalizados.filter(item => {
        const query = filtro.toLowerCase();
        const dni = item.dni ? item.dni.toString() : "";
        const nombreCompleto = `${item.nombres || ""} ${item.apellidos || ""}`.toLowerCase();
        
        return dni.includes(query) || nombreCompleto.includes(query);
    });

    // 2. LÓGICA DEL SEMÁFORO (Ordenanza Municipal)
    const obtenerEstadoVencimiento = (fecha) => {
        if (!fecha) return "fecha-pendiente";
        
        const hoy = new Date();
        const vencimiento = new Date(fecha);
        // Calculamos la diferencia en días
        const difTiempo = vencimiento - hoy;
        const difDias = Math.ceil(difTiempo / (1000 * 60 * 60 * 24));

        if (difDias < 0) return "fecha-vencida";      // Rojo (Ya venció)
        if (difDias <= 30) return "fecha-proxima";    // Dorado/Amarillo (Falta 1 mes o menos)
        return "fecha-vigente";                       // Verde (Más de un mes)
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
                            className="buscador-input" // Clase limpia para el input
                            placeholder="Buscar por DNI o Nombre..." 
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    <button onClick={cargarFormalizados} className="btn-actualizar-circular" title="Sincronizar datos">
                        <FaSync className={cargando ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="tabla-card">
                <table className="tabla-gestion">
                    <thead>
                        <tr>
                            <th>DNI</th>
                            <th>Comerciante</th>
                            <th>Vencimiento</th>
                            <th>Emisión de Documentos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosFiltrados.length > 0 ? (
                            datosFiltrados.map((item) => (
                                <tr key={item.comerciante_id}>
                                    <td>{item.dni}</td>
                                    <td><strong>{item.nombres} {item.apellidos}</strong></td>
                                    <td>
                                        {/* Aplicamos la clase dinámica según la fecha */}
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
                                <td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>
                                    {cargando ? "Consultando base de datos..." : "No se encontraron resultados para tu búsqueda."}
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
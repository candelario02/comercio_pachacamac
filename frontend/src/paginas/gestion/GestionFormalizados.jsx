import React, { useState, useEffect, useMemo } from 'react';
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

    // ESTA ES LA CLAVE: useMemo hace que el filtro sea "inteligente"
    // No borra nada, solo decide qué mostrar de la lista original
    const datosFiltrados = useMemo(() => {
        const busqueda = filtro.trim().toLowerCase();
        if (!busqueda) return formalizados; // Si borras el buscador, vuelve toda la lista

        return formalizados.filter(item => {
            const dni = item.dni ? String(item.dni) : "";
            const nombres = item.nombres ? String(item.nombres).toLowerCase() : "";
            const apellidos = item.apellidos ? String(item.apellidos).toLowerCase() : "";

            return dni.includes(busqueda) || 
                   nombres.includes(busqueda) || 
                   apellidos.includes(busqueda);
        });
    }, [filtro, formalizados]); 

    const obtenerEstadoVencimiento = (fecha) => {
        if (!fecha) return "fecha-pendiente";
        const hoy = new Date();
        const vencimiento = new Date(fecha);
        const difTiempo = vencimiento - hoy;
        const difDias = Math.ceil(difTiempo / (1000 * 60 * 60 * 24));

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
                                        <span className={`fecha-badge ${obtenerEstadoVencimiento(item.fecha_vencimiento)}`}>
                                            {item.fecha_vencimiento 
                                                ? new Date(item.fecha_vencimiento).toLocaleDateString('es-PE') 
                                                : 'Sin fecha'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-botones-flex">
                                            {/* BOTÓN COMERCIO (INTACTO) */}
                                            <button 
                                                className="btn-emitir carnet-comercio"
                                                onClick={() => generarCarnetPDF(item, 'comercio')}
                                            >
                                                <FaStore /> Comercio
                                            </button>

                                            {/* BOTÓN SANIDAD (INTACTO - SOLO SI DESEA TRAMITAR) */}
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
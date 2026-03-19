import React, { useState, useEffect } from 'react';
import { AdminServicio } from '../../servicios/adminApi';
import { FaSync, FaMedkit, FaStore, FaSearch } from 'react-icons/fa'; 
import { generarCarnetPDF } from '../../herramientas/generadorDocumentos'; 
import '../../estilos/gestion-expedientes.css';

const GestionFormalizados = () => {
    const [formalizados, setFormalizados] = useState([]);
    const [filtro, setFiltro] = useState(""); // Estado para el buscador
    const [cargando, setCargando] = useState(true);

    const cargarFormalizados = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const res = await AdminServicio.obtenerFormalizados(token);
            setFormalizados(res.data || []);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarFormalizados(); }, []);

    // Lógica del buscador
    const datosFiltrados = formalizados.filter(item => 
        item.dni.includes(filtro) || 
        item.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
        item.apellidos.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="gestion-contenedor">
            <header className="gestion-header-pro">
                <h2>Control de Formalizados</h2>
                <div className="acciones-header">
                    {/* BUSCADOR PROFESIONAL */}
                    <div className="buscador-caja">
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Buscar por DNI o Nombre..." 
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    <button onClick={cargarFormalizados} className="btn-actualizar-circular">
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
                        {datosFiltrados.map((item) => (
                            <tr key={item.comerciante_id}>
                                <td>{item.dni}</td>
                                <td><strong>{item.nombres} {item.apellidos}</strong></td>
                                <td>{item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : 'Pendiente'}</td>
                                <td className="acciones-flex">
                                    {/* BOTÓN 1: COMERCIO (Siempre visible) */}
                                    <button 
                                        className="btn-emitir carnet-comercio" 
                                        onClick={() => generarCarnetPDF(item, 'comercio')}
                                    >
                                        <FaStore /> Comercio
                                    </button>

                                    {/* BOTÓN 2: SANIDAD (Solo si lo pagó/requiere) */}
                                    {item.desea_tramitar_carnet && (
                                        <button 
                                            className="btn-emitir carnet-sanidad" 
                                            onClick={() => generarCarnetPDF(item, 'sanidad')}
                                        >
                                            <FaMedkit /> Sanidad
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionFormalizados;
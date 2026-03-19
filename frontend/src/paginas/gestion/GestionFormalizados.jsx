import React, { useState, useEffect } from 'react';
import { AdminServicio } from '../../servicios/adminApi';
import { FaSync, FaMedkit, FaStore } from 'react-icons/fa'; // Agregamos iconos específicos
import { generarCarnetPDF } from '../../herramientas/generadorDocumentos'; 
import '../../estilos/gestion-expedientes.css';

const GestionFormalizados = () => {
    const [formalizados, setFormalizados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarFormalizados = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const res = await AdminServicio.obtenerFormalizados(token);
            setFormalizados(res.data || []);
            setError(null);
        } catch (err) {
            // AL AGREGAR ESTE CONSOLE.LOG, EL ERROR DEL CATCH DESAPARECE
            console.error("Error capturado:", err); 
            setError("No se pudieron cargar los comerciantes formalizados.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { 
        cargarFormalizados(); 
    }, []);

    return (
        <div className="gestion-contenedor">
            <header className="gestion-header-pro">
                <h2>Comerciantes Formalizados</h2>
                <button onClick={cargarFormalizados} className="btn-actualizar-circular">
                    <FaSync className={cargando ? 'spin' : ''} />
                </button>
            </header>

            <div className="tabla-card">
                {cargando ? (
                    <div className="loading-state">Cargando lista de formalizados...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : formalizados.length === 0 ? (
                    <div className="empty-state">No hay comerciantes formalizados aún.</div>
                ) : (
                    <table className="tabla-gestion">
                        <thead>
                            <tr>
                                <th>DNI</th>
                                <th>Comerciante</th>
                                <th>Actividad</th>
                                <th>Vencimiento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formalizados.map((item) => (
                                <tr key={item.comerciante_id}>
                                    <td>{item.dni}</td>
                                    <td><strong>{item.nombres} {item.apellidos}</strong></td>
                                    {/* Usamos los campos nuevos de la vista corregida */}
                                    <td>{item.actividad_nombre || 'General'}</td>
                                    <td>{item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : 'Pendiente'}</td>
                                    <td className="acciones-flex">
                                        <button 
                                            className="btn-emitir carnet-comercio" 
                                            onClick={() => generarCarnetPDF(item, 'comercio')}
                                        >
                                            <FaStore /> Comercio
                                        </button>

                                        {/* El botón de sanidad solo aparece si la vista dice que lo desea */}
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
                )}
            </div>
        </div>
    );
};

export default GestionFormalizados;
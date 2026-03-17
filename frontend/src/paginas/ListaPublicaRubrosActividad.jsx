import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; 
import '../estilos/ListaPublicaRubrosActividad.css';

const ListaPublicaRubrosActividad = () => {
    const [rubros, setRubros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        
        axios.get(`${BASE_URL}/publico/info-completa`)
            .then(res => {
             
                const mapa = {};
                res.data.forEach(item => {
                    if (!mapa[item.rubro_id]) {
                        mapa[item.rubro_id] = { 
                            id: item.rubro_id, 
                            nombre: item.rubro_nombre, 
                            actividades: [] 
                        };
                    }
                    if (item.actividad_desc) {
                        mapa[item.rubro_id].actividades.push({ 
                            desc: item.actividad_desc, 
                            carnet: item.requiere_carnet_sanidad 
                        });
                    }
                });
                setRubros(Object.values(mapa));
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar datos:", err);
                setError("No se pudo cargar la información municipal.");
                setLoading(false);
            });
    }, []);

    
    if (loading) return <div className="loading-container"><p>Cargando información municipal...</p></div>;
    if (error) return <div className="error-container"><p>{error}</p></div>;

    return (
        <main className="lista-container">
            <h1 className="titulo-seccion">Rubros y Actividades - Pachacámac</h1>
            <div className="scroll-wrapper">
                {rubros.map((rubro) => (
                    <div key={rubro.id} className="rubro-card">
                        <div className="rubro-header">
                            <span className="icon">🏢</span>
                            <h2>{rubro.nombre}</h2>
                        </div>
                        <div className="actividades-list">
                            {rubro.actividades.length > 0 ? (
                                rubro.actividades.map((act, i) => (
                                    <div key={i} className="actividad-item">
                                        <p>{act.desc}</p>
                                        {act.carnet && <span className="badge-sanidad">🛡️ Carnet de Sanidad</span>}
                                    </div>
                                ))
                            ) : (
                                <p className="sin-datos">Sin actividades registradas.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default ListaPublicaRubrosActividad;
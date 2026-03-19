import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';
import { FaFilePdf, FaArrowLeft, FaIdCard, FaMedkit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { generarCarnetPDF, generarCarnetSanidadPDF } from '../utils/generadorDocumentos'; // Asegúrate de que la ruta sea correcta
import '../estilos/PortalComerciante.css';

const MisCarnets = () => {
    const [datosTramite, setDatosTramite] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerDatosParaCarnet = async () => {
            try {
                const token = localStorage.getItem('token');
                // Traemos el perfil actualizado para tener los datos del comerciante
                const res = await axios.get(`${BASE_URL}/comerciante/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Solo permitimos ver esto si el estado es formalizado
                if (res.data.estado_tramite === 'formalizado') {
                    setDatosTramite(res.data);
                }
            } catch (err) {
                console.error("Error al obtener datos:", err);
            } finally {
                setLoading(false);
            }
        };
        obtenerDatosParaCarnet();
    }, []);

    return (
        <div className="portal-container">
            <header className="portal-header">
                <button onClick={() => navigate('/panel-comerciante')} className="btn-regresar">
                    <FaArrowLeft /> Volver al Panel
                </button>
                <h1>Mis Documentos Oficiales</h1>
            </header>

            <div className="portal-content">
                <section className="card">
                    <h2><FaIdCard /> Documentos de Formalización</h2>
                    
                    {loading ? (
                        <p>Verificando credenciales...</p>
                    ) : datosTramite ? (
                        <div className="lista-documentos">
                            {/* BOTÓN CARNET DE COMERCIO */}
                            <div className="documento-item">
                                <div className="doc-info">
                                    <FaFilePdf className="pdf-icon" style={{ color: '#0066cc' }} />
                                    <div>
                                        <p className="doc-nombre">Carnet de Comerciante</p>
                                        <p className="doc-fecha">Estado: Vigente</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn-descargar color-comercio" 
                                    onClick={() => generarCarnetPDF(datosTramite)}
                                >
                                    Generar PDF
                                </button>
                            </div>

                            {/* BOTÓN CARNET DE SANIDAD */}
                            <div className="documento-item">
                                <div className="doc-info">
                                    <FaFilePdf className="pdf-icon" style={{ color: '#228b22' }} />
                                    <div>
                                        <p className="doc-nombre">Carnet de Sanidad</p>
                                        <p className="doc-fecha">Control Sanitario Pachacámac</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn-descargar color-sanidad" 
                                    onClick={() => generarCarnetSanidadPDF(datosTramite)}
                                    style={{ backgroundColor: '#228b22' }}
                                >
                                    Generar PDF
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="vacio-box">
                            <p>Tu trámite aún no ha sido formalizado por el administrador.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MisCarnets;
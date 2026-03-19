import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';
import { FaFilePdf, FaArrowLeft, FaIdCard, FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// Importación corregida a tu carpeta 'herramientas'
import { 
    generarCarnetPDF, 
    generarCarnetSanidadPDF, 
    generarOrdenPagoPDF 
} from '../herramientas/generadorDocumentos';
import '../estilos/MisCarnets.css';

const MisCarnets = () => {
    const [datosTramite, setDatosTramite] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerDatosParaCarnet = async () => {
            try {
                const token = localStorage.getItem('token');
                // Traemos el perfil para validar que el estado sea 'formalizado'
                const res = await axios.get(`${BASE_URL}/comerciante/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.data && res.data.estado_tramite === 'formalizado') {
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
                        <div className="loading-box">
                            <p>Verificando credenciales en el sistema...</p>
                        </div>
                    ) : datosTramite ? (
                        <div className="lista-documentos">
                            
                            {/* 1. CARNET DE COMERCIO */}
                            <div className="documento-item">
                                <div className="doc-info">
                                    <FaFilePdf className="pdf-icon" style={{ color: '#0066cc' }} />
                                    <div>
                                        <p className="doc-nombre">Carnet de Comerciante</p>
                                        <p className="doc-fecha">Estado: Vigente / Formalizado</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn-descargar color-comercio" 
                                    onClick={() => generarCarnetPDF(datosTramite)}
                                >
                                    Descargar Carnet
                                </button>
                            </div>

                            {/* 2. CARNET DE SANIDAD */}
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
                                    Descargar Carnet
                                </button>
                            </div>

                            {/* 3. HISTORIAL: ORDEN DE PAGO */}
                            <div className="documento-item historial" style={{ opacity: 0.8, marginTop: '20px', borderStyle: 'dashed' }}>
                                <div className="doc-info">
                                    <FaHistory className="pdf-icon" style={{ color: '#666' }} />
                                    <div>
                                        <p className="doc-nombre">Orden de Pago (Historial)</p>
                                        <p className="doc-fecha">Documento de trámite inicial</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn-descargar" 
                                    onClick={() => generarOrdenPagoPDF(datosTramite, { 
                                        total: datosTramite.monto_total || 0, 
                                        derecho: datosTramite.monto_derecho || 0, 
                                        carnet: datosTramite.monto_carnet || 0 
                                    })}
                                    style={{ backgroundColor: '#666' }}
                                >
                                    Ver Orden
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="vacio-box">
                            <p>No tienes documentos disponibles. Tu trámite debe estar en estado <strong>FORMALIZADO</strong>.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MisCarnets;
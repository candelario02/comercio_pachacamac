import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig'; 
import { 
    FaBell, FaInbox, FaFileUpload, FaFileDownload, 
    FaHistory, FaClock, FaTimes 
} from 'react-icons/fa'; 
import '../estilos/PortalComerciante.css';

const PortalComerciante = () => {
    const navigate = useNavigate();
    
    const [datos, setDatos] = useState(null);
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarInformacionPortal = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [resPerfil, resNotif] = await Promise.all([
                axios.get(`${BASE_URL}/comerciante/perfil`, config),
                axios.get(`${BASE_URL}/comerciante/notificaciones`, config)
            ]);

            setDatos(resPerfil.data);
            setNotificaciones(resNotif.data);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error("Error cargando el portal:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError("No se pudo cargar la información de tu perfil.");
                setLoading(false);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getStepClass = (stepName) => {
        if (!datos) return "step";
        const niveles = { 'Envío': 0, 'Revisión': 1, 'Pago': 2, 'Finalizado': 3 };
        const estadosMapper = {
            'pendiente': 1, 
            'observado': 1, 
            'aprobado': 2,   
            'pago_en_revision': 2, 
            'formalizado': 3 
        };
        const pasoActual = estadosMapper[datos.estado_tramite] || 0;
        if (niveles[stepName] < pasoActual) return "step active";
        if (niveles[stepName] === pasoActual) return "step current";
        return "step";
    };

    useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
        if (isMounted) {
            await cargarInformacionPortal();
        }
    };

    fetchData();

    return () => {
        isMounted = false; 
    };
},
 []);

    if (loading) return (
        <div className="loading-container">
            <p>Cargando tu portal comercial...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <p>{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
    );

    return (
        <div className="portal-container">
            <header className="portal-header">
                <div className="header-info">
                    <h1>Portal Comercial Pachacámac</h1>
                    <span className="user-badge">
                        {datos?.nombres} {datos?.apellidos}
                    </span>
                </div>
                <button className="btn-logout-x" onClick={handleLogout} title="Cerrar Sesión">
                    <FaTimes />
                </button>
            </header>

            <div className="portal-content">
                <section className="status-section card">
                    <h2><FaClock className="icon-status" /> Estado de mi Solicitud</h2>
                    <div className="stepper">
                        <div className={getStepClass('Envío')}>Envío</div>
                        <div className={getStepClass('Revisión')}>Revisión</div>
                        <div className={getStepClass('Pago')}>Pago</div>
                        <div className={getStepClass('Finalizado')}>Finalizado</div>
                    </div>
                    <div className="status-msg">
                        <strong>Estado actual: </strong> 
                        <span>
                            {datos?.estado_tramite === 'pendiente' && "En revisión por la Municipalidad."}
                            {datos?.estado_tramite === 'observado' && "Trámite con observaciones. Revisa notificaciones."}
                            {datos?.estado_tramite === 'aprobado' && "¡Aprobado! Pendiente de pago."}
                            {datos?.estado_tramite === 'pago_en_revision' && "Pago enviado. Esperando validación administrativa."}
                            {datos?.estado_tramite === 'formalizado' && "¡Felicidades! Trámite Finalizado."}
                        </span>
                    </div>
                </section>

                <section className="action-grid">
                    <button className="action-card color-notif">
                        <FaBell className="card-icon" />
                        <div className="card-text">
                            <h3>Notificaciones</h3>
                            <p>{notificaciones.length} mensajes nuevos</p>
                        </div>
                    </button>

                    <button className="action-card color-buzon">
                        <FaInbox className="card-icon" />
                        <div className="card-text">
                            <h3>Buzón Electrónico</h3>
                            <p>Consultas oficiales</p>
                        </div>
                    </button>

                    <button 
                        className={`action-card color-upload ${datos?.estado_tramite !== 'aprobado' ? 'disabled' : ''}`}
                        onClick={() => {
                            if (datos?.estado_tramite === 'aprobado') {
                                navigate('/subir-pago', { 
                                    state: { 
                                        ordenId: datos.orden_id, 
                                        codigoOrden: datos.codigo_orden, 
                                        monto: datos.monto_pendiente,
                                        mes: datos.mes_correspondiente 
                                    } 
                                });
                            }
                        }}
                        disabled={datos?.estado_tramite !== 'aprobado'}
                    >
                        <FaFileUpload className="card-icon" />
                        <div className="card-text">
                            <h3>Subir Comprobantes</h3>
                            <p>
                                {datos?.estado_tramite === 'pago_en_revision' 
                                    ? "Pago en revisión" 
                                    : (datos?.monto_pendiente ? `Monto: S/ ${datos.monto_pendiente}` : 'Pago de tasas')}
                            </p>
                        </div>
                    </button>

                    <button 
                        className={`action-card color-download ${datos?.estado_tramite !== 'formalizado' ? 'disabled' : ''}`}
                        onClick={() => datos?.estado_tramite === 'formalizado' && navigate('/mis-carnets')}
                        disabled={datos?.estado_tramite !== 'formalizado'}
                    >
                        <FaFileDownload className="card-icon" />
                        <div className="card-text">
                            <h3>Descargar Documentos</h3>
                            <p>{datos?.estado_tramite === 'formalizado' ? "Carnets listos" : "No disponible"}</p>
                        </div>
                    </button>

                    <button className="action-card color-history">
                        <FaHistory className="card-icon" />
                        <div className="card-text">
                            <h3>Historial</h3>
                            <p>Trámites anteriores</p>
                        </div>
                    </button>
                </section>
            </div>
        </div>
    );
};

export default PortalComerciante;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBell, FaInbox, FaFileUpload, FaFileDownload, 
    FaHistory, FaClock, FaTimes 
} from 'react-icons/fa'; 
import '../estilos/PortalComerciante.css';

const PortalComerciante = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div className="portal-container">
            <header className="portal-header">
                <div className="header-info">
                    <h1>Portal Comercial Pachacámac</h1>
                    <span className="user-badge">Comerciante Autorizado</span>
                </div>
                
                <button 
                    className="btn-logout-x" 
                    onClick={handleLogout} 
                    title="Cerrar Sesión"
                >
                    <FaTimes />
                </button>
            </header>

            <div className="portal-content">
                <section className="status-section card">
                    <h2><FaClock className="icon-status" /> Estado de mi Solicitud</h2>
                    <div className="stepper">
                        <div className="step active">Envío</div>
                        <div className="step current">Revisión</div>
                        <div className="step">Pago</div>
                        <div className="step">Finalizado</div>
                    </div>
                    <p className="status-msg">
                        Actualmente: <strong>Tu solicitud está siendo revisada por el administrador municipal.</strong>
                    </p>
                </section>

                <section className="action-grid">
                    <button className="action-card color-notif">
                        <FaBell className="card-icon" />
                        <div className="card-text">
                            <h3>Notificaciones</h3>
                            <p>Tienes 2 mensajes nuevos</p>
                        </div>
                    </button>

                    <button className="action-card color-buzon">
                        <FaInbox className="card-icon" />
                        <div className="card-text">
                            <h3>Buzón Electrónico</h3>
                            <p>Consultas y trámites</p>
                        </div>
                    </button>

                    <button className="action-card color-upload">
                        <FaFileUpload className="card-icon" />
                        <div className="card-text">
                            <h3>Subir Comprobantes</h3>
                            <p>Pagos de tasas municipales</p>
                        </div>
                    </button>

                    <button className="action-card color-download">
                        <FaFileDownload className="card-icon" />
                        <div className="card-text">
                            <h3>Descargar Documentos</h3>
                            <p>Formatos y autorizaciones</p>
                        </div>
                    </button>

                    <button className="action-card color-history">
                        <FaHistory className="card-icon" />
                        <div className="card-text">
                            <h3>Historial</h3>
                            <p>Ver trámites pasados</p>
                        </div>
                    </button>
                </section>
            </div>
        </div>
    );
};

export default PortalComerciante;
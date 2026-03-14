import React from 'react';
import { useNavigate } from 'react-router-dom';
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
            <header>
                <h1>Bienvenido a tu Portal Comercial</h1>
                <button onClick={handleLogout}>Cerrar Sesión</button>
            </header>
            
            <main>
                <div className="bloque">
                    <h2>Estado de mi Solicitud</h2>
                    <p>Tu solicitud está siendo revisada por el administrador.</p>
                </div>
            </main>
        </div>
    );
};

export default PortalComerciante;
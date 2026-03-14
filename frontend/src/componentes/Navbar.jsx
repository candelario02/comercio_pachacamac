import React from 'react';
import { Link } from 'react-router-dom';
import '../estilos/Navbar.css';
import escudopacha from '../assets/imagenes/logos/escudopacha.ico';

const Navbar = () => {
    return (
        <nav className="navbar-turquesa">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={escudopacha} alt="Logo" />
                    <span>Municipalidad de Pachacámac</span>
                </div>
                <div className="navbar-links">
                    <Link to="/">Inicio</Link>
                    <Link to="/rubros-y-actividades">Rubros y Actividades</Link>
                    <Link to="/ordenanzas">Ordenanzas</Link>
                    
                    
                    <Link to="/registro-solicitud" className="btn-solicitud">
                        Solicitar Licencia
                    </Link>
                    
                   
                    <Link to="/login" className="btn-acceso">Acceder</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
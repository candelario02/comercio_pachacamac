import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTags,      
  FaBook,      
  FaClipboardList, 
  FaCalendarCheck 
} from 'react-icons/fa'; 
import '../estilos/InicioPublico.css';

const InicioPublico = () => {
    const navigate = useNavigate();

    const rubros = [
        { id: 1, nombre: 'Categorías', path: '/categorias', icono: <FaTags /> },
        { id: 2, nombre: 'Definiciones', path: '/definiciones', icono: <FaBook /> },
        { id: 3, nombre: 'Requisitos', path: '/requisitos', icono: <FaClipboardList /> },
        { id: 4, nombre: 'Vigencia', path: '/vigencia', icono: <FaCalendarCheck /> },
        { id: 5, nombre: 'Prohibiciones', path: '/prohibiciones', icono: <FaClipboardList /> }
    ];

    return (
        <div className="inicio-container">
            <div className="espacio-superior-slider"></div>

            <div className="accesos-grid">
                {rubros.map((rubro) => (
                    <div 
                        key={rubro.id} 
                        className="acceso-item-dark"
                        onClick={() => navigate(rubro.path)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="acceso-icono-circle-cian">
                            <span className="icono">{rubro.icono}</span>
                        </div>
                        <span className="acceso-titulo-dark">{rubro.nombre}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InicioPublico;
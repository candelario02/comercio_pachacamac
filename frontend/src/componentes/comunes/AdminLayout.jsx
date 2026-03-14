import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTachometerAlt, FaListUl, FaBriefcase, FaSignOutAlt, FaFileAlt, FaIdCard } from 'react-icons/fa';


import '../../estilos/AdminLayout.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const [pendientes, setPendientes] = useState(0);

    useEffect(() => {
        // Función para obtener el conteo de la base de datos
        const obtenerConteo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/admin/estadisticas', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Actualizamos el estado con el valor de 'pendientes' que viene del backend
                setPendientes(res.data.pendientes || 0);
            } catch (error) {
                console.error("Error al actualizar notificaciones:", error);
            }
        };

        // Ejecución inmediata al cargar
        obtenerConteo();

        // Intervalo profesional de 1 minuto (60000ms)
        const intervaloId = setInterval(obtenerConteo, 60000);

        // Limpieza al desmontar el componente para evitar fugas de memoria
        return () => clearInterval(intervaloId);
    }, []);

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <h2 className="sidebar-title">Pachacámac Admin</h2>
                <nav className="sidebar-nav">
                    <button onClick={() => navigate('/admin-dashboard')}>
                        <FaTachometerAlt /> Dashboard
                    </button>
                    
                    {/* Nueva sección de Solicitudes con el Badge */}
                    <button onClick={() => navigate('/admin/solicitudes')} className="btn-notificacion">
                        <FaFileAlt /> Solicitudes
                        {pendientes > 0 && (
                            <span className="badge-notificacion">{pendientes}</span>
                        )}
                    </button>
                    <button onClick={() => navigate('/admin/formalizados')}>
                     <FaIdCard /> Formalizados
                    </button>

                    <button onClick={() => navigate('/admin/rubros')}>
                        <FaListUl /> Rubros
                    </button>
                    <button onClick={() => navigate('/admin/actividades')}>
                        <FaBriefcase /> Actividades
                    </button>
                    
                    <button className="logout-btn" onClick={() => navigate('/login')}>
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                </nav>
            </aside>
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
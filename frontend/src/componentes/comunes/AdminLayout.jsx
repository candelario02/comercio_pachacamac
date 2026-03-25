import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTachometerAlt, FaListUl, FaBriefcase, FaSignOutAlt, FaFileAlt, FaIdCard } from 'react-icons/fa';

import { BASE_URL } from '../../api/apiConfig';
import '../../estilos/AdminLayout.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const [pendientes, setPendientes] = useState(0);

    useEffect(() => {
        const obtenerConteo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${BASE_URL}/admin/estadisticas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setPendientes(res.data.pendientes || 0);
            } catch (error) {
                console.error("Error al actualizar notificaciones:", error);
            }
        };

        obtenerConteo();
        const intervaloId = setInterval(obtenerConteo, 60000);
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
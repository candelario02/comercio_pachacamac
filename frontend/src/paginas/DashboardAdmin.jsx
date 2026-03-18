import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa'; 

// 1. IMPORTAMOS LA BASE DINÁMICA
import { BASE_URL } from '../api/apiConfig';
import '../estilos/DashboardAdmin.css';

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, pendientes: 0, formalizados: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatosReales = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // 2. CAMBIAMOS LA URL FIJA POR LA VARIABLE `${BASE_URL}`
                const respuesta = await axios.get(`${BASE_URL}/admin/estadisticas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setStats(respuesta.data);
            } catch (error) {
                console.error("Error cargando estadísticas:", error);
                // Si el token expiró o es inválido, mandamos al login
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        cargarDatosReales();
    }, [navigate]);

    if (loading) return <div className="dashboard-container">Cargando datos...</div>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Panel de Administración Municipal</h1>
            
            <div className="kpi-container">
                <div className="kpi-card">
                    <FaUsers className="kpi-icon" />
                    <h3>Total Comerciantes</h3>
                    <p>{stats.total}</p>
                </div>
                <div className="kpi-card">
                    <FaClock className="kpi-icon" />
                    <h3>Pendientes</h3>
                    <p>{stats.pendientes}</p>
                </div>
                <div className="kpi-card">
                    <FaCheckCircle className="kpi-icon" />
                    <h3>Formalizados</h3>
                    <p>{stats.formalizados}</p>
                </div>
            </div>
            {/* para graficos 
            <div className="dashboard-chart-placeholder">
                
            </div>*/}
        </div>
    );
};

export default DashboardAdmin;
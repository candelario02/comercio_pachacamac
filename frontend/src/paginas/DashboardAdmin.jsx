import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa'; 
// IMPORTAMOS LOS COMPONENTES DE GRÁFICOS
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BASE_URL } from '../api/apiConfig';
import '../estilos/DashboardAdmin.css';

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, pendientes: 0, formalizados: 0 });
    // NUEVO ESTADO PARA GRÁFICOS
    const [graficos, setGraficos] = useState({ datosRubros: [], datosSanidad: [] });
    const [loading, setLoading] = useState(true);

    const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4444'];

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                // Cargamos estadísticas básicas (lo que ya tenías)
                const resStats = await axios.get(`${BASE_URL}/admin/estadisticas`, { headers });
                setStats(resStats.data);

                // CARGAMOS LOS NUEVOS GRÁFICOS (desde el nuevo endpoint que creamos)
                const resGraficos = await axios.get(`${BASE_URL}/admin/estadisticas-graficos`, { headers });
                if(resGraficos.data.success) {
                    setGraficos({
                        datosRubros: resGraficos.data.datosRubros,
                        datosSanidad: resGraficos.data.datosSanidad
                    });
                }

            } catch (error) {
                console.error("Error cargando dashboard:", error);
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        cargarTodo();
    }, [navigate]);

    if (loading) return <div className="dashboard-container">Cargando datos...</div>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Panel de Administración Municipal</h1>
            
            {/* TUS KPIs ORIGINALES (NO SE TOCAN) */}
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

            {/* SECCIÓN DE GRÁFICOS (LO NUEVO) */}
            <div className="graficos-grid">
                <div className="grafico-card">
                    <h3>Distribución por Rubros</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={graficos.datosRubros}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="valor"
                                    nameKey="etiqueta"
                                >
                                    {graficos.datosRubros.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grafico-card">
                    <h3>Control de Carnets de Sanidad</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={graficos.datosSanidad}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="valor"
                                    nameKey="etiqueta"
                                >
                                    <Cell fill="#00C49F" /> {/* Verde para Muni */}
                                    <Cell fill="#D1D5DB" /> {/* Gris para otros */}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
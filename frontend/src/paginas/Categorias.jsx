import React, { useState } from 'react';
import { FaUserTie, FaUsers, FaCalendarAlt, FaPlus, FaMinus } from 'react-icons/fa';
import '../estilos/Categorias.css';

const Categorias = () => {
    const [expandedCard, setExpandedCard] = useState(null);

    const categoriasLegales = [
        {
            id: 1,
            titulo: "Comerciante Ambulante Regulado",
            tipo: "Clasificación A",
            icono: <FaUserTie />,
            descripcion: "Persona natural inscrita en el Padrón Municipal que cuenta con evaluación técnica.",
            detalles: [
                "Derecho a solicitar autorización anual",
                "Sujeto a pagos por ocupación de vía pública",
                "Debe contar con mobiliario homologado",
                "Registro vigente en el Software de Comerciantes"
            ]
        },
        {
            id: 2,
            titulo: "Comercio Ambulante Temporal",
            tipo: "Clasificación B",
            icono: <FaCalendarAlt />,
            descripcion: "Actividades autorizadas por periodos cortos o festividades específicas.",
            detalles: [
                "Autorizaciones para ferias (máximo 30 días)",
                "Campañas escolares o navideñas",
                "Ubicaciones rotativas según evento",
                "Mobiliario desmontable obligatorio"
            ]
        },
        {
            id: 3,
            titulo: "Programas de Inclusión Municipal",
            tipo: "Clasificación C",
            icono: <FaUsers />,
            descripcion: "Categorías especiales para personas con discapacidad o adultos mayores.",
            detalles: [
                "Beneficios en tasas administrativas",
                "Zonas de ubicación preferencial",
                "Acompañamiento en formalización",
                "Prioridad en programas de capacitación"
            ]
        }
    ];

    const toggleCard = (id) => setExpandedCard(expandedCard === id ? null : id);

    return (
        <div className="categorias-main">
            <div className="titulo-cabecera">
                <h1>⚖️ Clasificación del Comerciante</h1>
                <p>Categorías administrativas establecidas por la Ordenanza N° 227-2019-MDP/C</p>
            </div>

            <div className="grid-categorias">
                {categoriasLegales.map((cat) => (
                    <div 
                        key={cat.id} 
                        className={`tarjeta-categoria ${expandedCard === cat.id ? 'expandida' : ''}`}
                        onClick={() => toggleCard(cat.id)}
                    >
                        <div className="cat-header">
                            <div className="cat-icon-box">{cat.icono}</div>
                            <div className="cat-info">
                                <span className="cat-badge">{cat.tipo}</span>
                                <h3>{cat.titulo}</h3>
                            </div>
                        </div>
                        <p style={{ color: '#ccc', margin: '10px 0' }}>{cat.descripcion}</p>
                        <div className="cat-detalles">
                            <strong>Características legales:</strong>
                            <ul className="giros-lista">
                                {cat.detalles.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                        </div>
                        <div className="cat-footer-info">
                            {expandedCard === cat.id ? <FaMinus /> : <FaPlus />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categorias;
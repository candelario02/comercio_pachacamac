import React, { useState } from 'react';
import { 
  FaArrowLeft, 
  FaClipboardList, 
  FaExclamationTriangle, 
  FaBan, 
  FaMapMarkedAlt, 
  FaUserSlash 
} from 'react-icons/fa';
import '../estilos/Requisitos.css'; 

export default function Prohibiciones() {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const lista = [
    {
      id: 1,
      titulo: "Intransferibilidad",
      icon: <FaUserSlash />,
      detalle: "La autorización es personal e intransferible. Está prohibido alquilar, vender o ceder el puesto."
    },
    {
      id: 2,
      titulo: "Zonas Rígidas",
      icon: <FaMapMarkedAlt />,
      detalle: "Prohibido comercializar en áreas de alto tráfico o zonas declaradas rígidas por la municipalidad."
    },
    {
      id: 3,
      titulo: "Giro Comercial",
      icon: <FaBan />,
      detalle: "No se permite la venta de productos distintos a los autorizados en su resolución (ej. alcohol, medicinas)."
    },
    {
      id: 4,
      titulo: "Uso de Ayudantes",
      icon: <FaClipboardList />,
      detalle: "El comercio debe ser directo. Solo se permite ayudante en casos de discapacidad o adulto mayor."
    }
  ];

  return (
    <div className="requisitos-main">
      <div className="container">

        <div className="titulo-cabecera">
          <h1>🚫 Prohibiciones Legales</h1>
          <p>Evite sanciones respetando las normas de la Ordenanza N° 227</p>
        </div>

        {lista.map((item) => (
          <div 
            key={item.id}
            className={`tarjeta-requisito ${activeAccordion === item.id ? 'activa' : ''}`}
            onClick={() => toggleAccordion(item.id)}
          >
            <div className="req-header">
              <h3>{item.titulo}</h3>
              <div className="req-icon-box">{item.icon}</div>
            </div>
            
            {activeAccordion === item.id && (
              <div className="req-detalles">
                <p>{item.detalle}</p>
                <div className="warning-alert">
                  <FaExclamationTriangle /> <strong>Atención:</strong> El incumplimiento genera la revocación inmediata.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
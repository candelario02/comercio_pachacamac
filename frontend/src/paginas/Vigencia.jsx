import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaHistory, FaExclamationCircle, FaArrowLeft, FaCalculator } from 'react-icons/fa';
import '../estilos/Requisitos.css'; 
export default function Vigencia() {
  const navigate = useNavigate();
  const [issueDate, setIssueDate] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [renovacion, setRenovacion] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('legal');

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const calcularFechas = (e) => {
    e.stopPropagation();
    if (!issueDate) {
      alert("Por favor, seleccione una fecha de emisión.");
      return;
    }

    const fechaEmision = new Date(issueDate);
    
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

    
    const fechaRenovacion = new Date(fechaVencimiento);
    fechaRenovacion.setDate(fechaRenovacion.getDate() - 30);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    setVencimiento(fechaVencimiento.toLocaleDateString('es-PE', options));
    setRenovacion(fechaRenovacion.toLocaleDateString('es-PE', options));
    setShowResults(true);
  };

  return (
    <div className="requisitos-main">
      <div className="container">
        <button type="button" className="btn-back" onClick={() => navigate('/ordenanzas')}>
          <FaArrowLeft /> Volver
        </button>

        <div className="titulo-cabecera">
          <h1>🕘 Vigencia y Renovación</h1>
          <p>Conozca los plazos legales de su autorización según Ordenanza</p>
        </div>

        <div className={`tarjeta-requisito ${activeAccordion === 'legal' ? 'activa' : ''}`}
             onClick={() => toggleAccordion('legal')}>
          <div className="req-header">
            <h3>Artículo 5º: Plazo de Vigencia</h3>
            <div className="req-icon-box"><FaHistory /></div>
          </div>
          <div className="req-detalles">
            <p>
              La Autorización Municipal tiene una vigencia de <strong>un (01) año</strong>. 
              Esta vence indefectiblemente el mismo día y mes de la emisión del año siguiente.
            </p>
            <div className="warning-alert">
              <FaExclamationCircle /> <strong>Importante:</strong> La renovación debe solicitarse con una anticipación mínima de <strong>30 días calendario</strong> antes del vencimiento.
            </div>
          </div>
        </div>

        <div className={`tarjeta-requisito ${activeAccordion === 'calculadora' ? 'activa' : ''}`}
             onClick={() => toggleAccordion('calculadora')}>
          <div className="req-header">
            <h3>Calculadora de Plazos de Renovación</h3>
            <div className="req-icon-box"><FaCalculator /></div>
          </div>
          <div className="req-detalles">
            <div className="simulador-container" onClick={(e) => e.stopPropagation()}>
              <p>Seleccione la fecha de emisión que figura en su carnet actual:</p>
              
              <div className="input-group-vigencia">
                <input
                  type="date"
                  className="input-date-custom"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
                <button className="btn-simular" onClick={calcularFechas}>
                  Calcular Vencimiento
                </button>
              </div>

              {showResults && (
                <div className="results-container">
                  <div className="result-item">
                    <span>📅 Su autorización vence el:</span>
                    <strong className="date-text">{vencimiento}</strong>
                  </div>
                  <div className="result-item highlight-renovacion">
                    <span>⚠️ Iniciar renovación antes del:</span>
                    <strong className="date-text">{renovacion}</strong>
                  </div>
                  <p className="nota-footer">
                    * Según el Artículo 5º de la Ordenanza N° 227.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
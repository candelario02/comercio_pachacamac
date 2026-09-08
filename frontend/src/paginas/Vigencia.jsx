import React, { useState } from 'react';
import { 
  FaHistory, 
  FaExclamationCircle, 
  FaArrowLeft, 
  FaCalculator 
} from 'react-icons/fa';
import { useModal } from '../context/ModalContext'; 
import '../estilos/Requisitos.css'; 
export default function Vigencia() {

  const { lanzarAlerta } = useModal();

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
      lanzarAlerta("Por favor, seleccione una fecha de emisión para realizar el cálculo.", "alerta");
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

    lanzarAlerta("Cálculo realizado con éxito. Revise los plazos en la parte inferior.", "exito");
  };

  return (
    <div className="requisitos-main">
      <div className="container">

        <div className="titulo-cabecera">
          <h1>🕘 Vigencia y Renovación</h1>
          <p>Consulte los plazos legales establecidos en la Ordenanza N° 227</p>
        </div>

        <div 
          className={`tarjeta-requisito ${activeAccordion === 'legal' ? 'activa' : ''}`}
          onClick={() => toggleAccordion('legal')}
        >
          <div className="req-header">
            <h3>Artículo 5º: Plazo de Vigencia</h3>
            <div className="req-icon-box"><FaHistory /></div>
          </div>
          <div className="req-detalles">
            <p>
              La Autorización Municipal tiene una vigencia de <strong>un (01) año</strong> calendario. 
              Vence el mismo día y mes de la emisión del año siguiente.
            </p>
            <div className="warning-alert">
              <FaExclamationCircle /> <strong>Aviso Legal:</strong> La solicitud de renovación debe presentarse <strong>30 días antes</strong> del vencimiento.
            </div>
          </div>
        </div>
        <div 
          className={`tarjeta-requisito ${activeAccordion === 'calculadora' ? 'activa' : ''}`}
          onClick={() => toggleAccordion('calculadora')}
        >
          <div className="req-header">
            <h3>Calculadora de Plazos</h3>
            <div className="req-icon-box"><FaCalculator /></div>
          </div>
          <div className="req-detalles">
            <div className="simulador-container" onClick={(e) => e.stopPropagation()}>
              <p>Ingrese la fecha de emisión de su autorización actual:</p>
              
              <div className="input-group-vigencia">
                <input
                  type="date"
                  className="input-date-custom"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
                <button className="btn-simular" onClick={calcularFechas}>
                  Calcular Fechas Legales
                </button>
              </div>

              {showResults && (
                <div className="results-container">
                  <div className="result-item">
                    <span>📅 Fecha de Vencimiento:</span>
                    <strong className="date-text">{vencimiento}</strong>
                  </div>
                  <div className="result-item highlight-renovacion">
                    <span>⚠️ Fecha límite para renovar:</span>
                    <strong className="date-text">{renovacion}</strong>
                  </div>
                  <p className="nota-footer">
                    * Los plazos mostrados son referenciales basados en la normativa vigente.
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
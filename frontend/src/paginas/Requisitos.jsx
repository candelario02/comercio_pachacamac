import React, { useState } from 'react';
import { FaChevronDown, FaExclamationTriangle, FaPlayCircle } from 'react-icons/fa';
import '../estilos/Requisitos.css';

export default function Requisitos() {
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [simulationResult, setSimulationResult] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);

    const toggleAccordion = (id) => {
        setActiveAccordion(activeAccordion === id ? null : id);
    };

    const simulateProcess = (e) => {
        e.stopPropagation(); 
        setIsSimulating(true);
        setSimulationResult("<span class='status-proceso'>⏳ Esperando respuesta municipal...</span>");

        setTimeout(() => {
            setSimulationResult("<span class='status-denegado'>❌ RESULTADO: SILENCIO NEGATIVO (Solicitud Denegada).</span>");
            setIsSimulating(false);
        }, 2000);
    };

    return (
        <div className="requisitos-main">
            <div className="titulo-cabecera">
                <h1>📋 Requisitos y Trámites</h1>
                <p>Proceso de formalización según la Ordenanza Municipal</p>
            </div>

            <div className={`tarjeta-requisito ${activeAccordion === 'autorizacion' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('autorizacion')}>
                <div className="req-header">
                    <h3>¿Qué es la Autorización Municipal?</h3>
                    <div className="req-icon-box"><FaChevronDown /></div>
                </div>
                <div className="req-detalles">
                    <p><strong>Artículo 6º:</strong> Es el permiso temporal que otorga la municipalidad a personas naturales inscritas en el Padrón Municipal.</p>
                    <p>Se evalúan tres criterios fundamentales:</p>
                    <ul>
                        <li>Evaluación Técnica (Ubicación y Módulo).</li>
                        <li>Evaluación Legal (Antecedentes y Normas).</li>
                        <li>Evaluación Económica Social.</li>
                    </ul>
                    <div className="warning-alert">
                        ⚠️ Nota: Este permiso no otorga propiedad sobre el espacio físico.
                    </div>
                </div>
            </div>

            <div className={`tarjeta-requisito ${activeAccordion === 'requisitos' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('requisitos')}>
                <div className="req-header">
                    <h3>Ingreso al Padrón Municipal</h3>
                    <div className="req-icon-box"><FaChevronDown /></div>
                </div>
                <div className="req-detalles">
                    <p>Para inscribirse en el Padrón de Pachacámac debe presentar:</p>
                    <ol style={{color: 'white', paddingLeft: '20px'}}>
                        <li>Declaración Jurada de ingreso.</li>
                        <li>DNI con domicilio en el distrito (preferente).</li>
                        <li>Certificado de salud (para giros de alimentos).</li>
                        <li>Declaración de no superar las 2 UIT de ingresos anuales.</li>
                        <li>No tener infracciones administrativas en los últimos 4 años.</li>
                    </ol>
                </div>
            </div>

            <div className={`tarjeta-requisito ${activeAccordion === 'silencio' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('silencio')}>
                <div className="req-header">
                    <h3>Entendiendo el Silencio Administrativo</h3>
                    <div className="req-icon-box"><FaChevronDown /></div>
                </div>
                <div className="req-detalles">
                    <p>En el distrito, este trámite está sujeto al <strong>Silencio Administrativo Negativo</strong>.</p>
                    <div className="warning-alert">
                        <FaExclamationTriangle /> Si la entidad no responde en el plazo legal, la solicitud se considera denegada automáticamente.
                    </div>
                    
                    <div className="simulador-container" onClick={(e) => e.stopPropagation()}>
                        <h4>Simulador de Respuesta</h4>
                        <button 
                            className="btn-simular" 
                            onClick={simulateProcess}
                            disabled={isSimulating}
                        >
                            <FaPlayCircle /> {isSimulating ? 'Procesando...' : 'Iniciar Trámite'}
                        </button>
                        <div className="resultado-texto" dangerouslySetInnerHTML={{ __html: simulationResult }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
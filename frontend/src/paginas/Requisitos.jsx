import React, { useState } from 'react';
import { 
    FaChevronDown, 
    FaExclamationTriangle, 
    FaFileSignature, 
    FaIdCard, 
    FaMoneyCheckAlt, 
    FaCloudUploadAlt, 
    FaCheckCircle 
} from 'react-icons/fa';
import '../estilos/Requisitos.css';

export default function Requisitos() {
    const [activeAccordion, setActiveAccordion] = useState(null);

    const toggleAccordion = (id) => {
        setActiveAccordion(activeAccordion === id ? null : id);
    };

    return (
        <div className="requisitos-main">
            <div className="titulo-cabecera">
                <h1>📋 Requisitos y Formalización</h1>
                <p>Guía paso a paso para la obtención de su autorización municipal</p>
            </div>

            {/* Paso 1: Documentación */}
            <div className={`tarjeta-requisito ${activeAccordion === 'requisitos' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('requisitos')}>
                <div className="req-header">
                    <h3>Paso 1: Documentación Necesaria</h3>
                    <div className="req-icon-box"><FaIdCard /></div>
                </div>
                <div className="req-detalles">
                    <p>Para su inscripción en el Padrón Municipal, asegúrese de contar con los siguientes documentos:</p>
                    <ul className="lista-requisitos-check">
                        <li><strong>DNI:</strong> Copia simple con dirección en el distrito.</li>
                        <li><strong>Certificado de Salud:</strong> Obligatorio para alimentos.</li>
                        <li><strong>Declaración Jurada:</strong> No superar las 2 UIT anuales.</li>
                        <li><strong>Record Administrativo:</strong> Sin multas en los últimos 4 años.</li>
                    </ul>
                    <div className="obs-entrega-fisica">
                        <h4>📢 OBSERVACIÓN IMPORTANTE:</h4>
                        <p>Todos los documentos deben ser entregados de manera física en ventanilla al momento de realizar su pago.</p>
                    </div>
                </div>
            </div>

            {/* Paso 2: Pago */}
            <div className={`tarjeta-requisito ${activeAccordion === 'proceso' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('proceso')}>
                <div className="req-header">
                    <h3>Paso 2: Pago y Visto Bueno</h3>
                    <div className="req-icon-box"><FaMoneyCheckAlt /></div>
                </div>
                <div className="req-detalles">
                    <ol className="lista-numerada-luz">
                        <li>Revisión de expediente físico en ventanilla.</li>
                        <li>Obtención del <strong>"Visto Bueno"</strong> del técnico.</li>
                        <li>Pago por Derecho de Trámite en caja.</li>
                    </ol>
                    <div className="warning-alert">
                        <FaExclamationTriangle /> Sin la entrega de documentos físicos, el pago no podrá ser habilitado.
                    </div>
                </div>
            </div>

            {/* Paso 3: Finalización Digital */}
            <div className={`tarjeta-requisito ${activeAccordion === 'finalizacion' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('finalizacion')}>
                <div className="req-header">
                    <h3>Paso 3: Finalización y Entrega Digital</h3>
                    <div className="req-icon-box"><FaCloudUploadAlt /></div>
                </div>
                <div className="req-detalles">
                    <p><strong>¡No necesita esperar en el local!</strong></p>
                    <div className="box-digital">
                        <p>1️⃣ Tome foto a su comprobante.</p>
                        <p>2️⃣ Súbalo a su <strong>Portal del Comerciante</strong>.</p>
                        <p>3️⃣ Sus carnets llegarán directamente a su portal para descargar.</p>
                    </div>
                    <div className="notificacion-exito">
                        <FaCheckCircle /> 
                        <p>Sus carnets autorizados serán enviados digitalmente.</p>
                    </div>
                </div>
            </div>

            {/* Resolución */}
            <div className={`tarjeta-requisito ${activeAccordion === 'silencio' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('silencio')}>
                <div className="req-header">
                    <h3>Información sobre la Resolución</h3>
                    <div className="req-icon-box"><FaFileSignature /></div>
                </div>
                <div className="req-detalles">
                    <p>Sujeto a <strong>Silencio Administrativo Negativo</strong>.</p>
                    <div className="info-legal-box">
                        <p>El plazo máximo es de 30 días hábiles. Si no hay respuesta, se considera denegada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
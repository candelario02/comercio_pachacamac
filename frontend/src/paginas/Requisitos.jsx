import React, { useState } from 'react';
import { FaChevronDown, FaExclamationTriangle, FaFileSignature, FaIdCard, FaMoneyCheckAlt } from 'react-icons/fa';
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

            <div className={`tarjeta-requisito ${activeAccordion === 'requisitos' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('requisitos')}>
                <div className="req-header">
                    <h3>Paso 1: Documentación Necesaria</h3>
                    <div className="req-icon-box"><FaIdCard /></div>
                </div>
                <div className="req-detalles">
                    <p>Para su inscripción en el Padrón Municipal, asegúrese de contar con los siguientes documentos vigentes:</p>
                    <ul className="lista-requisitos-check">
                        <li><strong>DNI:</strong> Copia simple con dirección en el distrito (preferente).</li>
                        <li><strong>Certificado de Salud:</strong> Obligatorio si el giro es de alimentos/bebidas.</li>
                        <li><strong>Declaración Jurada:</strong> No superar las 2 UIT anuales de ingresos.</li>
                        <li><strong>Record Administrativo:</strong> No tener multas o infracciones en los últimos 4 años.</li>
                    </ul>
                    
                    <div className="obs-entrega-fisica">
                        <h4>📢 OBSERVACIÓN IMPORTANTE:</h4>
                        <p>
                            Aunque usted inicie su trámite vía web, <strong>todos los documentos originales y copias deben ser entregados de manera física</strong> en la ventanilla de atención al momento de realizar su pago.
                        </p>
                    </div>
                </div>
            </div>
            <div className={`tarjeta-requisito ${activeAccordion === 'proceso' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('proceso')}>
                <div className="req-header">
                    <h3>Paso 2: Pago y Visto Bueno</h3>
                    <div className="req-icon-box"><FaMoneyCheckAlt /></div>
                </div>
                <div className="req-detalles">
                    <p>Una vez que el área correspondiente reciba y verifique sus documentos físicos:</p>
                    <ol className="lista-numerada-luz">
                        <li>El personal técnico revisará su expediente en ventanilla.</li>
                        <li>Se le otorgará el <strong>"Visto Bueno"</strong> tras confirmar que la información coincide con su solicitud web.</li>
                        <li>Con el visto bueno, procederá a realizar el <strong>Pago por Derecho de Trámite</strong> en caja.</li>
                    </ol>
                    <div className="warning-alert">
                        ⚠️ Sin la entrega de documentos físicos, el proceso de pago no podrá ser habilitado.
                    </div>
                </div>
            </div>

            <div className={`tarjeta-requisito ${activeAccordion === 'silencio' ? 'activa' : ''}`}
                 onClick={() => toggleAccordion('silencio')}>
                <div className="req-header">
                    <h3>Información sobre la Resolución</h3>
                    <div className="req-icon-box"><FaFileSignature /></div>
                </div>
                <div className="req-detalles">
                    <p>
                        De acuerdo al <strong>Artículo 8º de la Ordenanza N° 227</strong>, este trámite está sujeto a 
                        Evaluación Previa con <strong>Silencio Administrativo Negativo</strong>.
                    </p>
                    <div className="info-legal-box">
                        <p>
                            El plazo máximo de respuesta es de <strong>30 días hábiles</strong>. Si transcurrido este tiempo 
                            no recibe notificación, la ley establece que la solicitud se considera denegada, 
                            habilitando su derecho a presentar recursos de impugnación.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { FaBook, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import '../estilos/Definiciones.css';

const Definiciones = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const definitions = [
    { letter: 'a', category: 'Documento', term: 'Autorización Municipal', text: 'Documento personal e intransferible que se otorga a una persona natural para el ejercicio del comercio en la vía pública...' },
    { letter: 'b', category: 'Actividad', term: 'Comercio en la vía pública', text: 'La actividad económica que desarrollan los conductores autorizados en zonas o ubicaciones de la vía pública...' },
    { letter: 'c', category: 'Persona', term: 'Comerciante autorizado', text: 'Es el comerciante ambulante regulado que cuenta con una autorización municipal vigente...' },
    { letter: 'd', category: 'Registro', term: 'Comerciante Regulado', text: 'Persona Natural inscrita en el Padrón Municipal de Comerciantes que desarrollan Actividades Comerciales...' },
    { letter: 'e', category: 'Espacio', term: 'Espacio Público', text: 'Superficie de uso público conformado por vías públicas y zonas de recreción pública...' },
    { letter: 'f', category: 'Promoción', term: 'Ferias', text: 'Herramienta de promoción comercial que tiene por objetivo fomentar los bienes y/o servicios de la industria nacional...' },
    { letter: 'g', category: 'Infraestructura', term: 'Mobiliario Urbano', text: 'Es el conjunto de módulos y de ser el caso triciclos que ocupan la vía pública...' },
    { letter: 'h', category: 'Infraestructura', term: 'Módulo', text: 'Es el mobiliario desmontable y/o movible destinado exclusivamente para desarrollar la actividad comercial...' },
    { letter: 'i', category: 'Ubicación', term: 'Zonas autorizadas', text: 'Lugar de la vía pública donde el conductor autorizado le corresponde desarrollar su actividad económica.' },
    { letter: 'j', category: 'Ubicación', term: 'Zonas rígidas', text: 'Áreas de la vía pública del distrito, en las que por razones de ornato, seguridad o de ordenamiento urbano.' },
    { letter: 'k', category: 'Registro', term: 'Padrón Municipal', text: 'Es el registro que contiene la relación de comerciantes ambulantes regulados, reconocidos por la autoridad.' },
    { letter: 'l', category: 'Espacio', term: 'Vía Pública', text: 'Espacio de Propiedad Pública, dominio y Uso público, destinado para el tránsito peatonal y vehicular.' },
    { letter: 'm', category: 'Sistema', term: 'Software de Comerciantes', text: 'Base de Datos digital sustentada en el Padrón Municipal de Comerciantes.' },
    { letter: 'n', category: 'Actividad', term: 'Giro', text: 'Actividad Económica de venta de bienes y/o presentación de servicios debidamente autorizada.' },
    { letter: 'o', category: 'Ubicación', term: 'Zonas prohibidas', text: 'Áreas del espacio público donde no se autoriza el desarrollo del comercio ambulatorio por ornato o seguridad.' }
  ];

  return (
    <div className="definiciones-main">
      

      <div className="titulo-cabecera">
        <h1>📋 Glosario de Términos</h1>
        <p>Definiciones legales según la Ordenanza Municipal</p>
      </div>

      <div className="grid-definiciones">
        {definitions.map((def, index) => (
          <div
            key={index}
            className={`tarjeta-def ${expandedCard === index ? 'expandida' : ''}`}
            onClick={() => toggleCard(index)}
          >
            <div className="def-header">
              <span className="def-letra">{def.letter}</span>
              <span className="def-categoria">{def.category}</span>
            </div>
            
            <h3>{def.term}</h3>
            
            <p className="def-texto-corto">
              {def.text}
            </p>

            <div className="icon-expand">
              {expandedCard === index ? <FaMinus /> : <FaPlus />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Definiciones;
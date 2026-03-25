import React, { useState } from 'react';
import { FaFilePdf, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import '../estilos/Ordenanzas.css'; 

const Ordenanzas = () => {

  const [pdfActivo, setPdfActivo] = useState(null);

  const documentos = [
    {
      id: 1,
      titulo: "Ordenanza N° 108-2012-MDP/C",
      anio: "2012",
      descripcion: "Reglamento General que establece las normas para el comercio ambulatorio y ferial en el distrito de Pachacámac.",
      url: "/pdf/ordenanza1082012.pdf"
    },
    {
      id: 2,
      titulo: "Ordenanza N° 227-2019-MDP/C",
      anio: "2019",
      descripcion: "Actualización de los procedimientos administrativos y requisitos para la obtención de autorizaciones municipales.",
      url: "/pdf/ordenanza2272019.pdf"
    }
  ];

  return (
    <div className="ordenanzas-main">
      
      <div className="titulo-cabecera">
        <h1>Ordenanzas Municipales</h1>
        <p>Base legal actualizada del distrito</p>
      </div>

      <div className="grid-documentos">
        {documentos.map((doc) => (
          <div key={doc.id} className="tarjeta-pdf">
            
            <div className="tarjeta-top">
              <FaFilePdf className="icono-pdf-rojo" />
              <span className="anio-badge">{doc.anio}</span>
            </div>

            <h3>{doc.titulo}</h3>
            <p>{doc.descripcion}</p>
            
            <div className="botones-contenedor">

              <button 
                onClick={() => setPdfActivo(doc.url)} 
                className="btn-accion leer"
              >
                <FaExternalLinkAlt /> Ver aquí
              </button>

              <a 
                href={doc.url} 
                download
                className="btn-accion bajar"
              >
                <FaDownload /> Descargar
              </a>

            </div>
          </div>
        ))}
      </div>

      {pdfActivo && (
  <div className="visor-pdf">
    
    <div className="visor-contenido">

      <div className="visor-header">
        <button 
          className="btn-cerrar"
          onClick={() => setPdfActivo(null)}
        >
          ✖ Cerrar
        </button>
      </div>

      <iframe
        src={pdfActivo}
        title="Visor PDF"
        width="100%"
        height="100%"
      ></iframe>

    </div>

  </div>
)}

    </div>
  );
};

export default Ordenanzas;
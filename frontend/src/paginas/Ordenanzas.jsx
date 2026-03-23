import React from 'react';
import { FaFilePdf, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import '../estilos/Ordenanzas.css'; 

const Ordenanzas = () => {
  // Configuración de tu Cloudinary según las capturas
  const cloudName = "drkrsfxlc"; 
  const carpeta = "pachacamac";

  const documentos = [
    {
      id: 1,
      titulo: "Ordenanza N° 108-2012-MDP/C",
      anio: "2012",
      descripcion: "Reglamento General que establece las normas para el comercio ambulatorio y ferial en el distrito de Pachacámac.",
      nombreArchivo: "ORDENANZA%20108-2012-MDP-C%20-%20COMERCIO%20AMBULATORIO%20-%20ESCANEADO.pdf.pdf"
    },
    {
      id: 2,
      titulo: "Ordenanza N° 227-2019-MDP/C",
      anio: "2019",
      descripcion: "Actualización de los procedimientos administrativos y requisitos para la obtención de autorizaciones municipales.",
      nombreArchivo: "ORDENANZA%20MUNICIPAL%20227-2019-MDP-C%20-%20COMERCIO%20AMBULATORIO.pdf.pdf"
    }
  ];

  return (
    <div className="ordenanzas-main">
      <div className="titulo-cabecera">
        <h1>Ordenanzas Municipales</h1>
        <p>Base legal actualizada del distrito</p>
      </div>

      <div className="grid-documentos">
        {documentos.map((doc) => {
          // Construcción de la URL base para cada documento
          const urlBase = `https://res.cloudinary.com/${cloudName}/image/upload/v1/${carpeta}/${doc.nombreArchivo}`;

          return (
            <div key={doc.id} className="tarjeta-pdf">
              <div className="tarjeta-top">
                <FaFilePdf className="icono-pdf-rojo" />
                <span className="anio-badge">{doc.anio}</span>
              </div>
              
              <h3>{doc.titulo}</h3>
              <p>{doc.descripcion}</p>
              
              <div className="botones-contenedor">
                {/* BOTÓN VER ONLINE */}
                <a 
                  href={urlBase} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-accion leer"
                >
                  <FaExternalLinkAlt /> Ver Online
                </a>

                {/* BOTÓN DESCARGAR */}
                <a 
                  href={urlBase.replace('/upload/', '/upload/fl_attachment/')} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-accion bajar"
                >
                  <FaDownload /> Descargar
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ordenanzas;
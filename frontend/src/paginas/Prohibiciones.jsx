import React from 'react';
import '../estilos/Requisitos.css'; 
export default function Prohibiciones() {
  const prohibiciones = [
    {
      titulo: "Intransferibilidad",
      desc: "La autorización es personal. Prohibido vender, alquilar o traspasar el puesto o la credencial.",
      icon: "🚫"
    },
    {
      titulo: "Zonas Rígidas",
      desc: "No operar en áreas prohibidas por ornato o seguridad (Ej. Jr. Miguel Grau y tramos de Av. Manchay).",
      icon: "📍"
    },
    {
      titulo: "Productos Prohibidos",
      desc: "Terminantemente prohibida la venta de alcohol, medicinas, pirotécnicos o mercadería ilegal.",
      icon: "📦"
    },
    {
      titulo: "Sin Empleados",
      desc: "No puedes contratar personal. El comercio debe ser ejercido de forma directa por el titular.",
      icon: "👤"
    },
    {
      titulo: "Orden Público",
      desc: "Prohibido pernoctar en el módulo, usar megáfonos o realizar juegos de azar.",
      icon: "🤫"
    }
  ];

  return (
    <div className="container-cards"> 
      <h2 className="title-seccion">Prohibiciones y Sanciones</h2>
      <div className="grid-prohibiciones">
        {prohibiciones.map((item, index) => (
          <div key={index} className="card-cristal">
            <span className="icon-card">{item.icon}</span>
            <h3>{item.titulo}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="nota-informativa">
        <p><strong>Importante:</strong> El incumplimiento de estas normas faculta a la Municipalidad a revocar la autorización de forma inmediata.</p>
      </div>
    </div>
  );
}
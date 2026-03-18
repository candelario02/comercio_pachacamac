import React from 'react';
import '../estilos/InicioPublico.css';

const InicioPublico = () => {
    const rubros = [
        { id: 1, nombre: 'Licencias', icono: '📜' },
        { id: 2, nombre: 'Comercio', icono: '🏪' },
        { id: 3, nombre: 'Pagos', icono: '💰' },
        { id: 4, nombre: 'Fiscalización', icono: '🏢' }
    ];

    return (
        <div className="inicio-container">
            {/* Espacio para que se luzca el slider del santuario */}
            <div className="espacio-slider-libre"></div>

            <div className="contenedor-inferior">
                <h2 className="texto-bienvenida">Servicios al Ciudadano</h2>
                <div className="accesos-grid">
                    {rubros.map((rubro) => (
                        <div key={rubro.id} className="acceso-item-dark">
                            <div className="acceso-icono-circle-cian">
                                <span className="icono-emblem">{rubro.icono}</span>
                            </div>
                            <span className="acceso-titulo-dark">{rubro.nombre}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InicioPublico;
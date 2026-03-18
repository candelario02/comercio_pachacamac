import React from 'react';
import '../estilos/InicioPublico.css';

const InicioPublico = () => {
    const rubros = [
        { id: 1, nombre: 'Licencias' },
        { id: 2, nombre: 'Comercio' },
        { id: 3, nombre: 'Pagos' },
        { id: 4, nombre: 'Fiscalización' }
    ];

    const obtenerIcono = (nombre) => {
        const n = nombre.toLowerCase();
        if (n.includes('licencia')) return '📜';
        if (n.includes('comercio')) return '🏪';
        if (n.includes('pago')) return '💰';
        return '🏢';
    };

    return (
        <div className="inicio-container">
            <div className="accesos-grid">
                {rubros.map((rubro) => (
                    <div key={rubro.id} className="acceso-item-dark">
                        <div className="acceso-icono-circle-cian">
                            <span className="icono">{obtenerIcono(rubro.nombre)}</span>
                        </div>
                        <span className="acceso-titulo-dark">{rubro.nombre}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InicioPublico;
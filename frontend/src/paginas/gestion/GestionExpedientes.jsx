import React, { useState } from 'react';
import ListaPendientes from './ListaPendientes';
import ListaPagosPendientes from './ListaPagosPendientes';
import '../../estilos/gestion-expedientes.css'; 
const GestionExpedientes = () => {
    const [pestana, setPestana] = useState('pendientes');

    return (
        <div className="gestion-contenedor">
            <header className="gestion-header-pro">
                <div className="header-spacer"></div>

                <div className="header-titulo">
                    <h2>Gestión de Expedientes</h2>
                </div>

                <div className="header-acciones">
                    <div className="gestion-tabs">
                        <button 
                            className={`tab-btn ${pestana === 'pendientes' ? 'active' : ''}`} 
                            onClick={() => setPestana('pendientes')}
                        >
                            Pendientes
                        </button>
                        <button 
                            className={`tab-btn ${pestana === 'pagos' ? 'active' : ''}`} 
                            onClick={() => setPestana('pagos')}
                        >
                            Pagos Pendientes
                        </button>
                    </div>
                </div>
            </header>
            
            <div className="contenido">
                {pestana === 'pendientes' ? <ListaPendientes /> : <ListaPagosPendientes />}
            </div>
        </div>
    );
};

export default GestionExpedientes;
import React from 'react';
import '../../estilos/ModalAlerta.css';

const ModalAlerta = ({ modal, cerrar }) => {
    
    if (!modal.abierto) return null;

   
    const ejecutarAccion = () => {
        if (typeof modal.accion === "function") {
            modal.accion();
        }
        cerrar();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p className="modal-mensaje">{modal.mensaje}</p>

                <div className="modal-actions">
                    {modal.tipo === "confirmar" ? (
                        <>
                            <button
                                className="btn-cancelar"
                                onClick={cerrar}
                            >
                                No
                            </button>
                            <button
                                className="btn-confirmar"
                                onClick={ejecutarAccion}
                            >
                                Sí
                            </button>
                        </>
                    ) : (
                        <button 
                            className="btn-confirmar" 
                            onClick={ejecutarAccion}
                        >
                            Aceptar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalAlerta;
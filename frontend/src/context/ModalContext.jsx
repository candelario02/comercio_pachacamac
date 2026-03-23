import React, { createContext, useContext, useState } from "react";
import ModalAlerta from "../componentes/comunes/ModalAlerta";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        abierto: false,
        mensaje: "",
        tipo: "alerta",
        accion: () => {} 
    });

    const cerrarModal = () => {
        setModal({ abierto: false, mensaje: "", tipo: "alerta", accion: () => {} });
    };

  
const lanzarAlerta = (mensaje, tipo = "alerta", accion = () => {}) => {
    setModal({ abierto: true, mensaje, tipo, accion });
};

    const confirmar = (mensaje, accion = () => {}) => {
        setModal({ abierto: true, mensaje, tipo: "confirmar", accion });
    };

    return (
        <ModalContext.Provider value={{ lanzarAlerta, confirmar }}>
            {children}
            <ModalAlerta modal={modal} cerrar={cerrarModal} />
        </ModalContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => useContext(ModalContext);
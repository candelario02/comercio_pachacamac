import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminServicio } from '../servicios/adminApi';
import escudo from '../assets/imagenes/logos/selloparagenerardoc.png';
import { FaCheckCircle, FaTimesCircle, FaUserShield } from 'react-icons/fa';
import '../estilos/Validacion-publica.css'; 

const ValidacionPublica = () => {
    const [searchParams] = useSearchParams();
    const dni = searchParams.get("dni");
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const validar = async () => {
            if (!dni) {
                setCargando(false);
                return;
            }
            try {
                const res = await AdminServicio.validarQRPublico(dni);
                // Verificamos que res y res.data existan antes de setear
                if (res && res.data) {
                    setDatos(res.data);
                } else {
                    setDatos(null);
                }
            } catch (err) {
                console.error("Error validando:", err);
                setDatos(null);
            } finally {
                setCargando(false);
            }
        };
        validar();
    }, [dni]);

    if (cargando) {
        return (
            <div className="validacion-contenedor">
                <div className="cargando-spinner">Verificando...</div>
            </div>
        );
    }

    return (
        <div className="validacion-contenedor">
            <img src={escudo} alt="Escudo" className="validacion-escudo" />
            <h2 className="validacion-titulo">MUNICIPALIDAD DE PACHACÁMAC</h2>
            <p className="validacion-subtitulo">SISTEMA DE IDENTIFICACIÓN DIGITAL</p>
            
            <hr className="validacion-separador" />

            {datos ? (
                <div className="card-valido">
                    <FaCheckCircle className="icon-valido" />
                    <h3 className="texto-valido">CARNET VIGENTE</h3>
                    <p className="datos-nombre">{datos.nombres} {datos.apellidos}</p>
                    <div className="info-detallada">
                        <p><strong>DNI:</strong> {datos.dni}</p>
                        <p><strong>Vencimiento:</strong> {datos.fecha_vencimiento ? new Date(datos.fecha_vencimiento).toLocaleDateString('es-PE') : 'No registra'}</p>
                    </div>
                </div>
            ) : (
                <div className="card-invalido">
                    <FaTimesCircle className="icon-invalido" />
                    <h3 className="texto-invalido">NO ENCONTRADO</h3>
                    <p>La credencial consultada no existe, ha expirado o el DNI es incorrecto.</p>
                </div>
            )}

            <div className="footer-seguridad">
                <FaUserShield /> 
                <span>Consulta oficial: {new Date().toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default ValidacionPublica;
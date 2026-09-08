import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminServicio } from '../servicios/adminApi';
import escudo from '../assets/imagenes/logos/selloparagenerardoc.png';
import { FaCheckCircle, FaTimesCircle, FaUserShield } from 'react-icons/fa';
import '../estilos/Validacion-publica.css'; 

const ValidacionPublica = () => {
    const [searchParams] = useSearchParams();
    const dni = searchParams.get("dni");
    const tipoUrl = searchParams.get("tipo") || 'comercio'; 

    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const validar = async () => {
            if (!dni) {
                setCargando(false);
                return;
            }
            try {
                const res = await AdminServicio.validarQRPublico(dni, tipoUrl);
                if (res && res.data) {
                    setDatos(res.data);
                }
            } catch (err) {
                console.error("Error validando:", err);
                setDatos(null);
            } finally {
                setCargando(false);
            }
        };
        validar();
    }, [dni, tipoUrl]);

    if (cargando) return <div className="cargando">Verificando credencial...</div>;
    const esSanidad = tipoUrl === 'sanidad' || datos?.tipo_autorizacion?.toUpperCase() === 'SANIDAD';

    return (
        <div className="validacion-contenedor">
            <img src={escudo} alt="Escudo" className="validacion-escudo" />
            <h2 className="validacion-titulo">MUNICIPALIDAD DE PACHACÁMAC</h2>
            
            <hr className="validacion-separador" />

            {datos ? (
                <div className={`card-valido ${esSanidad ? 'card-sanidad' : 'card-comercio'}`}>
                    <FaCheckCircle className="icon-valido" />
                    
                    <h1 className="texto-valido">
                        {esSanidad ? 'SANIDAD' : 'FORMALIZADO'}
                    </h1>
                    
                    <p className="subtexto-valido">
                        {esSanidad ? 'Carnet de Sanidad Vigente' : 'Carnet de Comercio Vigente'}
                    </p>
                    
                    <p className="datos-nombre">{datos.nombres} {datos.apellidos}</p>
                    
                    <div className="info-detallada">
                        <p><strong>DNI:</strong> {datos.dni}</p>
                        <p><strong>Vencimiento:</strong> {new Date(datos.fecha_vencimiento).toLocaleDateString('es-PE')}</p>
                        <p><strong>Estado:</strong> <span className="tag-aprobado">VIGENTE</span></p>
                    </div>
                </div>
            ) : (
                <div className="card-invalido">
                    <FaTimesCircle className="icon-invalido" />
                    <h3 className="texto-invalido">NO ENCONTRADO</h3>
                    <p>La credencial no existe o ha expirado.</p>
                </div>
            )}

            <div className="footer-seguridad">
                <FaUserShield /> <span>Validación Oficial - {new Date().getFullYear()}</span>
            </div>
        </div>
    );
};

export default ValidacionPublica;
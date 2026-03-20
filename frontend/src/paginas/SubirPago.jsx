import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';
import { FaCloudUploadAlt, FaArrowLeft, FaCheckCircle, FaFileInvoiceDollar } from 'react-icons/fa';
import { useModal } from '../contexto/ModalContext'; // Importamos tu hook de alertas
import '../estilos/SubirPago.css'; 

const SubirPago = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { lanzarAlerta } = useModal(); // Inicializamos las alertas

    const { ordenId, codigoOrden, monto, mes } = location.state || {};

    const [archivo, setArchivo] = useState(null);
    const [numOperacion, setNumOperacion] = useState('');
    const [cargando, setCargando] = useState(false);
    const [vistaPrevia, setVistaPrevia] = useState(null);

    useEffect(() => {
        if (!ordenId) {
            navigate('/portal-comerciante');
        }
    }, [ordenId, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivo(file);
            setVistaPrevia(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!archivo || !numOperacion) {
            lanzarAlerta("Por favor, suba el comprobante e ingrese el número de operación.", "alerta");
            return;
        }

        setCargando(true);
        const formData = new FormData();
        formData.append('orden_id', ordenId);
        formData.append('monto_pagado', monto);
        formData.append('mes_correspondiente', mes);
        formData.append('voucher', archivo); 
        formData.append('numero_operacion', numOperacion);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/comerciante/registrar-pago`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                lanzarAlerta("¡Comprobante enviado con éxito! Revisaremos su pago pronto.", "exito", () => {
                    navigate('/portal-comerciante');
                });
            }
        } catch (error) {
            console.error("Error al subir pago:", error);
            lanzarAlerta(error.response?.data?.mensaje || "Error al conectar con el servidor", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="subir-pago-container">
            <header className="pago-header">
                <button onClick={() => navigate(-1)} className="btn-volver">
                    <FaArrowLeft /> Volver
                </button>
                <h1>Registro de Pago</h1>
            </header>

            <main className="pago-content">
                <form className="pago-card" onSubmit={handleSubmit}>
                    <div className="instrucciones">
                        <h3><FaCheckCircle className="icon-check" /> Orden: {codigoOrden}</h3>
                        <p>Adjunte su comprobante de pago para validación.</p>
                    </div>

                    <div className="info-orden-resumen">
                        <div className="info-item">
                            <FaFileInvoiceDollar className="info-icon" />
                            <div className="detalles">
                                <strong>Monto a depositar:</strong>
                                <p className="monto-resaltado">S/ {monto}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="detalles extra">
                                <strong>Mes de Tasa:</strong>
                                <p>{mes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Número de Operación:</label>
                        <input 
                            type="text" 
                            placeholder="Ej: 00982341"
                            value={numOperacion}
                            onChange={(e) => setNumOperacion(e.target.value)}
                            required
                        />
                    </div>

                    <div className={`upload-box ${archivo ? 'has-file' : ''}`}>
                        <input 
                            type="file" 
                            id="file-upload" 
                            accept="image/*"
                            onChange={handleFileChange}
                            hidden
                        />
                        <label htmlFor="file-upload" className="upload-label">
                            {vistaPrevia ? (
                                <div className="preview-container">
                                    <img src={vistaPrevia} alt="Vista previa" className="preview-img" />
                                    <span>Cambiar imagen</span>
                                </div>
                            ) : (
                                <div className="upload-placeholder">
                                    <FaCloudUploadAlt size={45} />
                                    <span>Seleccionar Voucher</span>
                                    <small>JPG o PNG</small>
                                </div>
                            )}
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-confirmar-pago"
                        disabled={cargando}
                    >
                        {cargando ? "Procesando..." : "Enviar Comprobante"}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default SubirPago;
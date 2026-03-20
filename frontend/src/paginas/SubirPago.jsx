import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';
import { FaCloudUploadAlt, FaArrowLeft, FaCheckCircle, FaFileInvoiceDollar } from 'react-icons/fa';
import '../estilos/SubirPago.css'; 

const SubirPago = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Recibimos los datos enviados desde el Portal
    const { ordenId, codigoOrden, monto, mes } = location.state || {};

    const [archivo, setArchivo] = useState(null);
    const [numOperacion, setNumOperacion] = useState('');
    const [cargando, setCargando] = useState(false);
    const [vistaPrevia, setVistaPrevia] = useState(null);

    // Si no hay datos de orden, regresamos al portal por seguridad
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
            alert("Por favor, suba el comprobante e ingrese el número de operación.");
            return;
        }

        setCargando(true);
        const formData = new FormData();
        
        // Datos automáticos que vienen del portal
        formData.append('orden_id', ordenId);
        formData.append('monto_pagado', monto);
        formData.append('mes_correspondiente', mes);
        
        // Datos que ingresa el usuario
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
                alert("¡Comprobante enviado con éxito! Revisaremos su pago pronto.");
                navigate('/portal-comerciante');
            }
        } catch (error) {
            console.error("Error al subir pago:", error);
            alert(error.response?.data?.mensaje || "Error al conectar con el servidor");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="subir-pago-container">
            <header className="pago-header">
                <button onClick={() => navigate(-1)} className="btn-volver">
                    <FaArrowLeft /> Volver al Portal
                </button>
                <h1>Registro de Pago de Tasa</h1>
            </header>

            <main className="pago-content">
                <form className="pago-card card" onSubmit={handleSubmit}>
                    <div className="instrucciones">
                        <h3><FaCheckCircle color="#2ecc71" /> Pago de Orden: {codigoOrden}</h3>
                        <p>Verifique los detalles de su orden y adjunte su comprobante.</p>
                    </div>

                    <div className="info-orden-resumen">
                        <div className="info-item">
                            <FaFileInvoiceDollar className="info-icon" />
                            <div>
                                <strong>Monto a depositar:</strong>
                                <p className="monto-resaltado">S/ {monto}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <div style={{ marginLeft: '35px' }}>
                                <strong>Mes:</strong>
                                <p>{mes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Número de Operación / Referencia:</label>
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
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            hidden
                        />
                        <label htmlFor="file-upload" className="upload-label">
                            {vistaPrevia ? (
                                <img src={vistaPrevia} alt="Vista previa" className="preview-img" />
                            ) : (
                                <>
                                    <FaCloudUploadAlt size={50} />
                                    <span>Click para seleccionar comprobante</span>
                                    <small>(Imagen del voucher)</small>
                                </>
                            )}
                        </label>
                        {archivo && <p className="file-name">{archivo.name}</p>}
                    </div>

                    <button 
                        type="submit" 
                        className="btn-confirmar-pago"
                        disabled={cargando}
                    >
                        {cargando ? "Enviando..." : "Confirmar y Enviar Pago"}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default SubirPago;
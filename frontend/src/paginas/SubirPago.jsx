import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../api/apiConfig';
import { FaCloudUploadAlt, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import '../estilos/SubirPago.css'; 

const SubirPago = () => {
    const navigate = useNavigate();
    const [archivo, setArchivo] = useState(null);
    const [numOperacion, setNumOperacion] = useState('');
    const [cargando, setCargando] = useState(false);
    const [vistaPrevia, setVistaPrevia] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivo(file);
            setVistaPrevia(URL.createObjectURL(file)); // Para que el usuario vea qué subió
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
        formData.append('voucher', archivo); // El nombre 'voucher' debe coincidir con Multer en el backend
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
                        <h3><FaCheckCircle color="#2ecc71" /> Paso Final</h3>
                        <p>Adjunte la captura de pantalla o foto de su voucher de pago realizado en el banco o transferencia.</p>
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
                                    <small>(Imagen o PDF)</small>
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
                        {cargando ? "Enviando..." : "Confirmar y Finalizar Trámite"}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default SubirPago;
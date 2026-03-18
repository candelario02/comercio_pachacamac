import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapaUbicacion from '../componentes/MapaUbicacion';
import ModalAlerta from '../componentes/comunes/ModalAlerta';
import '../estilos/SolicitudComerciante.css';
import { obtenerRubrosPublicos } from '../servicios/rubroApi';
import { obtenerActividadesPublicas } from '../servicios/actividadApi';
import { obtenerSectores } from '../servicios/comerciantesPublicoApi';
import { registrarSolicitud } from '../servicios/solicitudApi';

const SolicitudComerciante = () => {
    const navigate = useNavigate();
    
    const [tipoDoc, setTipoDoc] = useState('DNI');
    const [formData, setFormData] = useState({
        dni: '', nombres: '', apellidos: '', celular: '',
        correo: '', contrasena: '', rubro_id: '', actividad_id: '', 
        sector_id: '', lat: null, lng: null, archivo_carnet: null,
        desea_tramitar_carnet: false
    });

    const [enviando, setEnviando] = useState(false);
    const [rubros, setRubros] = useState([]);
    const [todasActividades, setTodasActividades] = useState([]);
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requiereCarnet, setRequiereCarnet] = useState(false);
    const [modal, setModal] = useState({ abierto: false, mensaje: '', tipo: 'info', accion: null });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const resultados = await Promise.all([obtenerRubrosPublicos(), obtenerActividadesPublicas(), obtenerSectores()]);
                const [r, a, s] = resultados.map(res => res?.data || res || []);
                setRubros(Array.isArray(r) ? r : []);
                setTodasActividades(Array.isArray(a) ? a : []);
                setSectores(Array.isArray(s) ? s : []);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    useEffect(() => {
        if (formData.rubro_id) {
            setActividadesFiltradas(todasActividades.filter(a => String(a.rubro_id) === String(formData.rubro_id)));
        }
    }, [formData.rubro_id, todasActividades]);

    useEffect(() => {
        const actividad = todasActividades.find(a => String(a.id) === String(formData.actividad_id));
        setRequiereCarnet(actividad?.requiere_carnet_sanidad || false);
    }, [formData.actividad_id, todasActividades]);

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        
        if (name === 'dni') {
            const limite = tipoDoc === 'DNI' ? 8 : 11;
            const soloNumeros = value.replace(/[^0-9]/g, '').slice(0, limite);
            setFormData(prev => ({ ...prev, [name]: soloNumeros }));
            return;
        }
        if (name === 'celular') {
            const soloNumeros = value.replace(/[^0-9]/g, '').slice(0, 9);
            setFormData(prev => ({ ...prev, [name]: soloNumeros }));
            return;
        }

        // Lógica de checkbox
        if (type === 'checkbox') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: checked,
                archivo_carnet: checked ? null : prev.archivo_carnet // Limpiamos archivo si marca que desea tramitar
            }));
            if (checked) {
                setModal({ abierto: true, mensaje: "Nota: Al solicitar la gestión del carnet, se incluirá el costo del trámite en tu orden de pago.", tipo: 'info' });
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.lat || !formData.lng) {
            setModal({ abierto: true, mensaje: "Por favor, selecciona la ubicación en el mapa.", tipo: 'info' });
            return;
        }

        if (requiereCarnet && !formData.archivo_carnet && !formData.desea_tramitar_carnet) {
            setModal({ abierto: true, mensaje: "Esta actividad requiere carnet. Súbelo o solicita que lo tramitemos.", tipo: 'info' });
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        setEnviando(true);
        try {
            await registrarSolicitud(data);
            setModal({ 
                abierto: true, 
                mensaje: "¡Solicitud enviada con éxito! El administrador revisará tu información.", 
                tipo: 'info', 
                accion: () => navigate('/login') 
            });
        } catch (error) {
            setModal({ abierto: true, mensaje: error.response?.data?.mensaje || "Error al enviar tu solicitud.", tipo: 'info' });
        } finally {
            setEnviando(false);
        }
    };

    // ... (Tus imports y lógica de estado se mantienen IGUAL) ...

    if (loading) return <div className="cargando" style={{textAlign:'center', padding:'50px'}}>Cargando formulario...</div>;

    return (
        <div className="main-registro-container">
            <form onSubmit={handleSubmit} className="formulario-solicitud">
                <h2>Registro de Solicitud</h2>

                <div className="bloque">
                    <h3>1. Datos Personales</h3>
                    <select onChange={(e) => { setTipoDoc(e.target.value); setFormData(prev => ({...prev, dni: ''})) }} style={{marginBottom: '10px'}}>
                        <option value="DNI">DNI (8 dígitos)</option>
                        <option value="RUC">RUC (11 dígitos)</option>
                    </select>
                    <input name="dni" value={formData.dni} onChange={handleChange} placeholder={`${tipoDoc} (máx ${tipoDoc === 'DNI' ? 8 : 11} dígitos)`} required />
                    <input name="nombres" onChange={handleChange} placeholder="Nombres" required />
                    <input name="apellidos" onChange={handleChange} placeholder="Apellidos" required />
                    <input name="celular" value={formData.celular} onChange={handleChange} placeholder="Celular (9 dígitos)" required />
                    <input name="correo" type="email" onChange={handleChange} placeholder="Correo Electrónico" required />
                    <input name="contrasena" type="password" onChange={handleChange} placeholder="Contraseña" required />
                </div>

                <div className="bloque">
                    <h3>2. Actividad Comercial</h3>
                    <select name="rubro_id" onChange={handleChange} required>
                        <option value="">Seleccione Rubro</option>
                        {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                    
                    <select name="actividad_id" onChange={handleChange} required disabled={!formData.rubro_id}>
                        <option value="">Seleccione Actividad</option>
                        {actividadesFiltradas.map(a => <option key={a.id} value={a.id}>{a.descripcion}</option>)}
                    </select>

                    {requiereCarnet && (
                        <div className="bloque-carnet">
                            <div className="contenedor-check-carnet">
                                <input type="checkbox" name="desea_tramitar_carnet" checked={formData.desea_tramitar_carnet} onChange={handleChange} id="check-tramite" />
                                <label htmlFor="check-tramite" style={{cursor:'pointer'}}>Deseo tramitar mi Carnet de Sanidad (Adicional)</label>
                            </div>

                            {!formData.desea_tramitar_carnet && (
                                <div className="campo-archivo">
                                    <label className="subir-archivo-info">Subir documento aquí (Imagen o PDF):</label>
                                    <input type="file" name="archivo_carnet" accept="image/*,.pdf" onChange={handleChange} required />
                                </div>
                            )}
                        </div>
                    )}

                    <select name="sector_id" onChange={handleChange} required>
                        <option value="">Seleccione Sector</option>
                        {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                <div className="bloque">
                    <h3>3. Ubicación del Puesto</h3>
                    <MapaUbicacion onCoordsChange={(coords) => setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }))} />
                    {formData.lat && (
                        <div className="coordenadas-info">
                            <p><strong>Ubicación fijada correctamente:</strong></p>
                            <p>Lat: {formData.lat.toFixed(6)} | Lng: {formData.lng.toFixed(6)}</p>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn-enviar" disabled={enviando}>
                    {enviando ? "Enviando..." : "Registrar Solicitud"}
                </button>

                <ModalAlerta modal={modal} cerrar={() => setModal({...modal, abierto: false})} />
            </form>
        </div>
    );
};

export default SolicitudComerciante;
import React, { useState, useEffect, useCallback } from 'react';
import { obtenerRubros, gestionarRubro } from '../servicios/rubroApi';
import { useModal } from '../context/ModalContext';
import '../estilos/GestionRubros.css';

const GestionRubros = () => {
    const [rubros, setRubros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
    
    const [formData, setFormData] = useState({ 
        nombre: '', 
        descripcion: '' 
    });

    const { lanzarAlerta, confirmar } = useModal();

    const cargarRubros = useCallback(async () => {
        setLoading(true);
        try {
            const res = await obtenerRubros();
            setRubros(res.data);
        } catch (error) {
            console.error("Error al cargar rubros:", error);
            lanzarAlerta("Error al cargar la lista de rubros.");
        } finally {
            setLoading(false);
        }
    }, [lanzarAlerta]);

    useEffect(() => { 
        cargarRubros(); 
    }, [cargarRubros]);

    const eliminarRubro = (id) => {
        confirmar("¿Estás seguro de eliminar este rubro?", async () => {
            try {
                await gestionarRubro({ accion: 'DELETE', id });
                await cargarRubros();
                lanzarAlerta("Rubro eliminado correctamente.");
            } catch (err) {
                console.error("Error al eliminar:", err);
                lanzarAlerta("Error al eliminar el rubro.");
            }
        });
    };

    const guardarRubro = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...formData, 
                accion: rubroSeleccionado ? 'UPDATE' : 'INSERT', 
                id: rubroSeleccionado ? rubroSeleccionado.id : null 
            };
            
            await gestionarRubro(payload);
            
            lanzarAlerta("Operación realizada con éxito.");
            setRubroSeleccionado(null);
            setFormData({ nombre: '', descripcion: '' });
            await cargarRubros();
        } catch (err) {
            console.error("Error al guardar:", err);
            lanzarAlerta("Error al procesar la información.");
        }
    };

    if (loading) return <div className="loading">Cargando datos...</div>;

    return (
        <div className="gestion-container">
            <h3>Gestión de Rubros - Pachacámac</h3>

            <form className="formulario-fijo" onSubmit={guardarRubro}>
                <h4>{rubroSeleccionado ? 'Editar Rubro' : 'Registrar Nuevo Rubro'}</h4>
                <div className="form-inputs">
                    <input 
                        type="text" 
                        placeholder="Nombre del Rubro" 
                        value={formData.nombre} 
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                        required 
                    />
                    <input 
                        type="text" 
                        placeholder="Descripción (Opcional)" 
                        value={formData.descripcion} 
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                    />
                    <div className="button-group">
                        <button type="submit" className={`btn-base ${rubroSeleccionado ? 'btn-update' : 'btn-nuevo'}`}>
                            {rubroSeleccionado ? 'Actualizar' : 'Guardar'}
                        </button>
                        {rubroSeleccionado && (
                            <button type="button" className="btn-cancelar" onClick={() => { 
                                setRubroSeleccionado(null); 
                                setFormData({ nombre: '', descripcion: '' }); 
                            }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </form>
            
            <table className="tabla-base">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {rubros.length > 0 ? rubros.map((r) => (
                        <tr key={r.id}>
                            <td>{r.nombre}</td>
                            <td>{r.descripcion || 'Sin descripción'}</td>
                            <td className="acciones-container">
                                <button className="btn-base btn-edit" onClick={() => {
                                    setRubroSeleccionado(r);
                                    setFormData({ nombre: r.nombre, descripcion: r.descripcion || '' });
                                }}>Editar</button>
                                <button className="btn-base btn-delete" onClick={() => eliminarRubro(r.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    )) : <tr><td colSpan="3">No hay registros disponibles.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

export default GestionRubros;
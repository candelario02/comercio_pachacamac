import React, { useState, useEffect, useCallback } from 'react';


import { obtenerActividades, gestionarActividad } from '../servicios/actividadApi';
import { useModal } from '../context/ModalContext';
import '../estilos/GestionActividades.css';

const GestionActividades = () => {
   
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [formData, setFormData] = useState({ 
        rubro_id: '', codigo: '', descripcion: '', requiere_sanidad: false 
    });

    const { lanzarAlerta, confirmar } = useModal();

    const cargarActividades = useCallback(async () => {
        setLoading(true);
        try {
            const res = await obtenerActividades();
            setActividades(res.data);
        } catch (error) {
            console.error("Error al cargar actividades:", error);
            lanzarAlerta("Error al cargar la lista de actividades.");
        } finally {
            setLoading(false);
        }
    }, [lanzarAlerta]);

    useEffect(() => { cargarActividades(); }, [cargarActividades]);

    const eliminarActividad = (id) => {
        confirmar("¿Estás seguro de que deseas eliminar esta actividad?", async () => {
            try {
                await gestionarActividad({ accion: 'DELETE', id: id });
                await cargarActividades();
                lanzarAlerta("Actividad eliminada correctamente.");
            } catch (err) {
                console.error("Error al eliminar:", err);
                lanzarAlerta("Error al eliminar la actividad.");
            }
        });
    };

    const guardarActividad = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...formData, 
                accion: actividadSeleccionada ? 'UPDATE' : 'INSERT', 
                id: actividadSeleccionada ? actividadSeleccionada.id : null 
            };
            await gestionarActividad(payload);
            lanzarAlerta("Operación realizada con éxito.");
            setActividadSeleccionada(null);
            setFormData({ rubro_id: '', codigo: '', descripcion: '', requiere_sanidad: false });
            await cargarActividades();
        } catch (err) {
            console.error("Error al guardar:", err);
            lanzarAlerta("Error al procesar la información en la base de datos.");
        }
    };

    if (loading) return <div className="loading">Cargando datos...</div>;

    return (
        <div className="gestion-container">
            <form className="formulario-fijo" onSubmit={guardarActividad}>
                <h4>{actividadSeleccionada ? 'Editar Actividad' : 'Registrar Nueva Actividad'}</h4>
                <div className="form-inputs">
                    <input type="number" placeholder="ID Rubro" value={formData.rubro_id} onChange={(e) => setFormData({...formData, rubro_id: e.target.value})} required />
                    <input type="text" placeholder="Código" value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} required />
                    <input type="text" placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} required />
                    <label>
                        <input type="checkbox" checked={formData.requiere_sanidad} onChange={(e) => setFormData({...formData, requiere_sanidad: e.target.checked})} />
                        ¿Requiere Sanidad?
                    </label>
                    <div className="button-group">
                        <button type="submit" className={`btn-base ${actividadSeleccionada ? 'btn-update' : 'btn-nuevo'}`}>
                            {actividadSeleccionada ? 'Actualizar' : 'Guardar'}
                        </button>
                        {actividadSeleccionada && (
                            <button type="button" className="btn-cancelar" onClick={() => { 
                                setActividadSeleccionada(null); 
                                setFormData({ rubro_id: '', codigo: '', descripcion: '', requiere_sanidad: false }); 
                            }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </form>
            
            <table className="tabla-base">
                <thead>
                    <tr><th>Código</th><th>Rubro</th><th>Descripción</th><th>Sanidad</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {actividades.length > 0 ? (
                        actividades.map((act) => (
                            <tr key={act.id}>
                                <td>{act.codigo_municipal}</td>
                                <td>{act.nombre_rubro}</td>
                                <td>{act.descripcion}</td>
                                <td>{act.requiere_carnet_sanidad ? '✅ SI' : '❌ NO'}</td>
                                <td className="acciones-container">
                                    <button className="btn-base btn-edit" onClick={() => {
                                        setActividadSeleccionada(act);
                                        setFormData({ 
                                            rubro_id: act.rubro_id, 
                                            codigo: act.codigo_municipal, 
                                            descripcion: act.descripcion, 
                                            requiere_sanidad: act.requiere_carnet_sanidad 
                                        });
                                    }}>Editar</button>
                                    <button className="btn-base btn-delete" onClick={() => eliminarActividad(act.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{ padding: '20px', color: '#666' }}>No hay registros disponibles.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default GestionActividades;
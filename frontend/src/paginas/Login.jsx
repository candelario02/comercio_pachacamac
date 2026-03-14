import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext'; 
import LayoutFondo from '../componentes/LayoutFondo';
import '../estilos/Login.css';
import escudopacha from '../assets/imagenes/logos/escudopacha.ico';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();
    const { lanzarAlerta } = useModal(); 

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const respuesta = await axios.post('http://localhost:5000/api/auth/login', { correo, contrasena });
            const { token, usuario, success } = respuesta.data;
            if (success) {
                localStorage.setItem('token', token);
                localStorage.setItem('rol', usuario.rol);
                localStorage.setItem('usuario_id', usuario.id);
                lanzarAlerta(`¡Bienvenido al sistema!`, "alerta", () => {
                    usuario.rol === 'administrador' ? navigate('/admin-dashboard') : navigate('/panel-comerciante');

                    
                });
            }
        } catch (error) {
            lanzarAlerta(error.response?.data?.mensaje || "Error de conexión", "alerta"); 
        } finally {
            setCargando(false);
        }
    };

    return (
        <LayoutFondo>
            <div className="login-container">
                <form className="login-card" onSubmit={manejarEnvio}>
                    <div className="login-header">
                        <img src={escudopacha} alt="Escudo" className="login-logo-img" />
                        <h2>Municipalidad de Pachacámac</h2>
                        <h3>Sistema de Gestión Ambulatoria</h3>
                    </div>
                    
                    <div className="login-form-body">
                        <div className="input-group">
                            <label>Correo Electrónico</label>
                            <input type="email" placeholder="ejemplo@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Contraseña</label>
                            <input type="password" placeholder="••••••••" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-login" disabled={cargando}>
                            {cargando ? "Verificando..." : "Ingresar al Sistema"}
                        </button>
                    </div>
                </form>
            </div>
        </LayoutFondo>
    );
};

export default Login;
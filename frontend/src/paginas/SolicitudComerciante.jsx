import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MapaUbicacion from "../componentes/MapaUbicacion";
import ModalAlerta from "../componentes/comunes/ModalAlerta";
import "../estilos/SolicitudComerciante.css";
import { obtenerRubrosPublicos } from "../servicios/rubroApi";
import { obtenerActividadesPublicas } from "../servicios/actividadApi";
import { obtenerSectores } from "../servicios/comerciantesPublicoApi";
import { registrarSolicitud } from "../servicios/solicitudApi";
import { consultarDniReniec } from "../servicios/reniecApi";

const SolicitudComerciante = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const modoEdicion = location.state?.modoEdicion || false;
  const observaciones = location.state?.observaciones || {};
  const [datosCargados, setDatosCargados] = useState(false);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [formData, setFormData] = useState({
    dni: "",
    nombres: "",
    apellidos: "",
    numero_celular: "",
    correo_electronico: "",
    contrasena: "",
    rubro_id: "",
    actividad_id: "",
    sector_id: "",
    latitud_puesto: null,
    longitud_puesto: null,
    archivo_carnet: null,
    archivo_puesto: null,
    desea_tramitar_carnet: false,
  });

  const [enviando, setEnviando] = useState(false);
  const [rubros, setRubros] = useState([]);
  const [todasActividades, setTodasActividades] = useState([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requiereCarnet, setRequiereCarnet] = useState(false);
  const [modal, setModal] = useState({
    abierto: false,
    mensaje: "",
    tipo: "info",
    accion: null,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const resultados = await Promise.all([
          obtenerRubrosPublicos(),
          obtenerActividadesPublicas(),
          obtenerSectores(),
        ]);
        const [r, a, s] = resultados.map((res) => res?.data?.data || res?.data || res || []);
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
      setActividadesFiltradas(
        todasActividades.filter(
          (a) => String(a.rubro_id) === String(formData.rubro_id),
        ),
      );
    }
  }, [formData.rubro_id, todasActividades]);

  useEffect(() => {
    const actividad = todasActividades.find(
      (a) => String(a.id) === String(formData.actividad_id),
    );
    setRequiereCarnet(actividad?.requiere_carnet_sanidad || false);
  }, [formData.actividad_id, todasActividades]);

  useEffect(() => {
    const cargarDatosPrecargados = () => {
      if (
        modoEdicion &&
        location.state?.datosPrecargados &&
        todasActividades.length > 0 &&
        !datosCargados
      ) {
        const d = location.state.datosPrecargados;
        const actividadRef = todasActividades.find(
          (a) => String(a.id) === String(d.actividad_id),
        );

        const rubroIdCalculado = actividadRef
          ? String(actividadRef.rubro_id)
          : "";

        setFormData({
          dni: d.dni || "",
          nombres: d.nombres || "",
          apellidos: d.apellidos || "",
          numero_celular: d.numero_celular || "",
          correo_electronico: d.correo_electronico || "",
          rubro_id: rubroIdCalculado ? String(rubroIdCalculado) : "",
          actividad_id: d.actividad_id ? String(d.actividad_id) : "",
          sector_id: d.sector_id ? String(d.sector_id) : "",
          latitud_puesto: d.latitud_puesto
            ? parseFloat(d.latitud_puesto)
            : null,
          longitud_puesto: d.longitud_puesto
            ? parseFloat(d.longitud_puesto)
            : null,
          desea_tramitar_carnet: d.desea_tramitar_carnet === true,
        });

        if (rubroIdCalculado) {
          setActividadesFiltradas(
            todasActividades.filter(
              (a) => String(a.rubro_id) === rubroIdCalculado,
            ),
          );
        }

        setDatosCargados(true);
      }
    };
    cargarDatosPrecargados();
  }, [modoEdicion, location.state, todasActividades, datosCargados]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === "numero_celular") {
      const soloNumeros = value.replace(/[^0-9]/g, "").slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
      return;
    }
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        archivo_carnet: checked ? null : prev.archivo_carnet,
      }));
      if (checked) {
        setModal({
          abierto: true,
          mensaje:
            "Nota: Al solicitar la gestión del carnet, se incluirá el costo del trámite en tu orden de pago.",
          tipo: "info",
        });
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  //función específica para el DNI automatica
  const handleDniChange = (e) => {
    const soloNumeros = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    setFormData((prev) => ({ ...prev, dni: soloNumeros }));

    if (soloNumeros.length === 8 && !modoEdicion) {
      buscarDniEnReniec(soloNumeros);
    }
  };
  //funcion de foto
  const handleSubmit = async (e) => {
    e.preventDefault();
    const debeValidarUbicacion =
      !modoEdicion || observaciones.obsUbicacion === true;

    if (
      debeValidarUbicacion &&
      (!formData.latitud_puesto || !formData.longitud_puesto)
    ) {
      setModal({
        abierto: true,
        mensaje: "Por favor, selecciona la ubicación en el mapa.",
        tipo: "info",
      });
      return;
    }
    if (!modoEdicion && !formData.archivo_puesto) {
      setModal({
        abierto: true,
        mensaje: "Sube una foto referencial del puesto.",
        tipo: "info",
      });
      return;
    }

    const data = new FormData();
    const datosParaEnvio = { ...formData };

    if (
      !datosParaEnvio.apellidos &&
      (datosParaEnvio.apellido_paterno || datosParaEnvio.apellido_materno)
    ) {
      datosParaEnvio.apellidos =
        `${datosParaEnvio.apellido_paterno || ""} ${datosParaEnvio.apellido_materno || ""}`.trim();
    }

    Object.keys(datosParaEnvio).forEach((key) => {
      const valor = datosParaEnvio[key];
      if (valor === "" || valor === null || valor === undefined) {
        data.append(key, "");
      } else {
        data.append(key, valor);
      }
    });

    if (modoEdicion && location.state?.datosPrecargados?.id) {
      data.append("id", location.state.datosPrecargados.id);
    }

    setEnviando(true);
    try {
      await registrarSolicitud(data);
      setModal({
        abierto: true,
        mensaje: modoEdicion
          ? "¡Correcciones enviadas con éxito!"
          : "¡Solicitud registrada con éxito!",
        tipo: "info",
        accion: () => navigate(modoEdicion ? "/panel-comerciante" : "/login"),
      });
    } catch (error) {
      setModal({
        abierto: true,
        mensaje:
          error.response?.data?.mensaje || "Error al procesar la solicitud.",
        tipo: "info",
      });
    } finally {
      setEnviando(false);
    }
  };
  //funcion para buscar dni
  const buscarDniEnReniec = async (dni) => {
    setBuscandoDni(true);
    try {
      const datos = await consultarDniReniec(dni);
      const persona = datos.data;
      const apellidoPaterno = persona.apellidoPaterno || "";
      const apellidoMaterno = persona.apellidoMaterno || "";
      setFormData((prev) => ({
        ...prev,
        nombres: persona.nombres || "",
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        apellidos: `${apellidoPaterno} ${apellidoMaterno}`.trim(),
      }));
      setModal({
        abierto: true,
        mensaje: "✅ DNI encontrado. Los datos se han cargado automáticamente.",
        tipo: "info",
      });
    } catch (error) {
      console.error(error);
      setFormData((prev) => ({
        ...prev,
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
      }));
      setModal({
        abierto: true,
        mensaje:
          "❌ DNI no encontrado en Reniec. Por favor, completa tus datos manualmente.",
        tipo: "info",
      });
    } finally {
      setBuscandoDni(false);
    }
  };

  if (loading)
    return (
      <div
        className="cargando"
        style={{ textAlign: "center", padding: "50px" }}
      >
        Cargando formulario...
      </div>
    );

  return (
    <div className="main-registro-container">
      <form onSubmit={handleSubmit} className="formulario-solicitud">
        <h2>Registro de Solicitud</h2>

        <div className="bloque">
          <h3>1. Datos Personales</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <input
              name="dni"
              value={formData.dni}
              onChange={handleDniChange}
              readOnly={modoEdicion}
              placeholder="DNI (8 dígitos)"
              required
              className={modoEdicion ? "input-readonly" : ""}
              style={{ flex: 1 }}
            />
            {buscandoDni && (
              <span style={{ fontSize: "0.7rem", color: "#0d6efd" }}>
                Consultando Reniec...
              </span>
            )}
          </div>
          <input
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            readOnly={modoEdicion || !!formData.nombres}
            placeholder="Nombres"
            required
            className={
              modoEdicion || !!formData.nombres ? "input-readonly" : ""
            }
          />

          <input
            name="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={handleChange}
            readOnly={modoEdicion || !!formData.apellido_paterno}
            placeholder="Apellido Paterno"
            required
            className={
              modoEdicion || !!formData.apellido_paterno ? "input-readonly" : ""
            }
          />

          <input
            name="apellido_materno"
            value={formData.apellido_materno}
            onChange={handleChange}
            readOnly={modoEdicion || !!formData.apellido_materno}
            placeholder="Apellido Materno"
            required
            className={
              modoEdicion || !!formData.apellido_materno ? "input-readonly" : ""
            }
          />

          <input
            name="numero_celular"
            value={formData.numero_celular}
            onChange={handleChange}
            readOnly={modoEdicion}
            placeholder="Celular"
            required
            className={modoEdicion ? "input-readonly" : ""}
          />

          <input
            name="correo_electronico"
            value={formData.correo_electronico}
            onChange={handleChange}
            readOnly={modoEdicion}
            placeholder="Correo Electrónico"
            required
            className={modoEdicion ? "input-readonly" : ""}
          />

          {!modoEdicion && (
            <input
              name="contrasena"
              type="password"
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
          )}
        </div>

        <div className="bloque">
          <h3>2. Actividad Comercial</h3>

          <select
            name="rubro_id"
            value={formData.rubro_id}
            onChange={handleChange}
            required
            disabled={
              modoEdicion &&
              !(observaciones.obsActividad || observaciones.obsCarnet)
            }
          >
            <option value="">Seleccione Rubro</option>
            {rubros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          <select
            name="actividad_id"
            value={formData.actividad_id}
            onChange={handleChange}
            required
            disabled={
              !formData.rubro_id ||
              (modoEdicion &&
                !(observaciones.obsActividad || observaciones.obsCarnet))
            }
          >
            <option value="">Seleccione Actividad</option>
            {actividadesFiltradas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.descripcion}
              </option>
            ))}
          </select>
          {requiereCarnet && (
            <div className="bloque-carnet">
              <div className="contenedor-check-carnet">
                <input
                  type="checkbox"
                  name="desea_tramitar_carnet"
                  checked={formData.desea_tramitar_carnet}
                  onChange={handleChange}
                  id="check-tramite"
                  disabled={modoEdicion && !observaciones.obsCarnet}
                />
                <label htmlFor="check-tramite" style={{ cursor: "pointer" }}>
                  Deseo tramitar mi Carnet de Sanidad (Adicional)
                </label>
              </div>

              {!formData.desea_tramitar_carnet && (
                <div className="campo-archivo">
                  <label className="subir-archivo-info">
                    Subir documento aquí (Solo Imagen):
                  </label>
                  <input
                    type="file"
                    name="archivo_carnet"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleChange}
                    required={!modoEdicion && !formData.desea_tramitar_carnet}
                    disabled={modoEdicion && !observaciones.obsCarnet}
                  />
                </div>
              )}
            </div>
          )}

          <select
            name="sector_id"
            value={formData.sector_id}
            onChange={handleChange}
            required
            disabled={
              modoEdicion &&
              !(observaciones.obsUbicacion || observaciones.obsActividad)
            }
          >
            <option value="">Seleccione Sector</option>
            {sectores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="bloque">
          <h3>3. Ubicación del Puesto</h3>
          <MapaUbicacion
            readonly={modoEdicion && !observaciones.obsUbicacion}
            onCoordsChange={(coords) => {
              if (modoEdicion && !observaciones.obsUbicacion) return;

              setFormData((prev) => ({
                ...prev,
                latitud_puesto: coords.lat,
                longitud_puesto: coords.lng,
              }));
            }}
          />

          {formData.latitud_puesto && (
            <div className="coordenadas-info">
              <p>
                <strong>Ubicación fijada correctamente:</strong>
              </p>
              <p>
                Lat: {formData.latitud_puesto.toFixed(6)} | Lng:{" "}
                {formData.longitud_puesto.toFixed(6)}
              </p>
            </div>
          )}

          <div className="campo-archivo">
            <label className="subir-archivo-info">
              Foto Referencial del Puesto (Obligatorio):
            </label>
            <input
              type="file"
              name="archivo_puesto"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleChange}
              required={!modoEdicion || !!observaciones.obsUbicacion}
              disabled={modoEdicion && !observaciones.obsUbicacion}
              className={
                modoEdicion && !observaciones.obsUbicacion
                  ? "input-readonly"
                  : ""
              }
            />
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button type="submit" className="btn-enviar" disabled={enviando}>
            {enviando
              ? "Enviando..."
              : modoEdicion
                ? "Guardar Correcciones"
                : "Registrar Solicitud"}
          </button>
          <p
            style={{
              fontSize: "0.7rem",
              color: "#6c6c6c",
              marginTop: "12px",
              maxWidth: "450px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Tus datos están protegidos. Solo se usarán para gestionar tu
            solicitud. No los compartiremos con terceros sin tu
            consentimiento."Municipalidad distrital de Pachacamac"
          </p>
        </div>

        <ModalAlerta
          modal={modal}
          cerrar={() => setModal({ ...modal, abierto: false })}
        />
      </form>
    </div>
  );
};

export default SolicitudComerciante;

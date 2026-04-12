import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MapaUbicacion from "../componentes/MapaUbicacion";
import ModalAlerta from "../componentes/comunes/ModalAlerta";
import "../estilos/SolicitudComerciante.css";
import { obtenerRubrosPublicos } from "../servicios/rubroApi";
import { obtenerActividadesPublicas } from "../servicios/actividadApi";
import { obtenerSectores } from "../servicios/comerciantesPublicoApi";
import { registrarSolicitud } from "../servicios/solicitudApi";

const SolicitudComerciante = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const modoEdicion = location.state?.modoEdicion || false;
  const observaciones = location.state?.observaciones || {};

  const [tipoDoc, setTipoDoc] = useState("DNI");
  const [formData, setFormData] = useState({
    dni: "",
    nombres: "",
    apellidos: "",
    celular: "",
    correo: "",
    contrasena: "",
    rubro_id: "",
    actividad_id: "",
    sector_id: "",
    lat: null,
    lng: null,
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
        const [r, a, s] = resultados.map((res) => res?.data || res || []);
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
    if (modoEdicion && location.state?.datosPrecargados) {
      const d = location.state.datosPrecargados;
      setFormData((prev) => ({
        ...prev,
        dni: d.dni || "",
        nombres: d.nombres || "",
        apellidos: d.apellidos || "",
        celular: d.celular || "",
        correo: d.correo || "",
        rubro_id: d.rubro_id || "",
        actividad_id: d.actividad_id || "",
        sector_id: d.sector_id || "",
        lat: d.lat ? parseFloat(d.lat) : null,
        lng: d.lng ? parseFloat(d.lng) : null,
        desea_tramitar_carnet:
          d.desea_tramitar_carnet === "true" ||
          d.desea_tramitar_carnet === true,
      }));
    }
  }, [modoEdicion, location.state]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === "dni") {
      const limite = tipoDoc === "DNI" ? 8 : 11;
      const soloNumeros = value.replace(/[^0-9]/g, "").slice(0, limite);
      setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
      return;
    }
    if (name === "celular") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      setModal({
        abierto: true,
        mensaje: "Por favor, selecciona la ubicación en el mapa.",
        tipo: "info",
      });
      return;
    }

    if (!formData.archivo_puesto) {
      setModal({
        abierto: true,
        mensaje:
          "Por favor, sube una foto referencial de la ubicación del puesto.",
        tipo: "info",
      });
      return;
    }

    if (
      requiereCarnet &&
      !formData.archivo_carnet &&
      !formData.desea_tramitar_carnet
    ) {
      setModal({
        abierto: true,
        mensaje:
          "Esta actividad requiere carnet. Súbelo o solicita que lo tramitemos.",
        tipo: "info",
      });
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "contrasena" && modoEdicion) return;

      // Solo agregamos al FormData si el valor existe
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    setEnviando(true);
    try {
      await registrarSolicitud(data);

      setModal({
        abierto: true,
        mensaje: modoEdicion
          ? "¡Correcciones enviadas con éxito! Tu expediente será revisado nuevamente por la Municipalidad."
          : "¡Solicitud enviada con éxito! Recuerda que para completar el trámite debes acercarte a la Municipalidad con tus documentos físicos para el Visto Bueno y Pago correspondiente.",
        tipo: "info",
        accion: () => navigate(modoEdicion ? "/panel-comerciante" : "/login"),
      });
    } catch (error) {
      setModal({
        abierto: true,
        mensaje:
          error.response?.data?.mensaje ||
          "Error al procesar tu solicitud. Inténtalo de nuevo.",
        tipo: "info",
      });
    } finally {
      setEnviando(false);
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

          <select
            disabled={modoEdicion}
            onChange={(e) => {
              setTipoDoc(e.target.value);
              setFormData((prev) => ({ ...prev, dni: "" }));
            }}
            style={{ marginBottom: "10px" }}
            value={tipoDoc}
          >
            <option value="DNI">DNI (8 dígitos)</option>
            <option value="RUC">RUC (11 dígitos)</option>
          </select>

          <input
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            readOnly={modoEdicion}
            placeholder={`${tipoDoc} (máx ${tipoDoc === "DNI" ? 8 : 11} dígitos)`}
            required
            className={modoEdicion ? "input-readonly" : ""}
          />

          <input
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            readOnly={modoEdicion}
            placeholder="Nombres"
            required
          />

          <input
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            readOnly={modoEdicion}
            placeholder="Apellidos"
            required
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
            value={formData.rubro_id} // Vinculado para precarga
            onChange={handleChange}
            required
            disabled={modoEdicion && !observaciones.obsActividad} // Bloqueado si no hay observación
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
            value={formData.actividad_id} // Vinculado para precarga
            onChange={handleChange}
            required
            disabled={
              !formData.rubro_id || (modoEdicion && !observaciones.obsActividad)
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
                    required={!modoEdicion || observaciones.obsCarnet}
                    disabled={modoEdicion && !observaciones.obsCarnet}
                  />
                </div>
              )}
            </div>
          )}

          <select
            name="sector_id"
            value={formData.sector_id} // Vinculado para precarga
            onChange={handleChange}
            required
            disabled={modoEdicion && !observaciones.obsUbicacion}
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
            onCoordsChange={(coords) =>
              setFormData((prev) => ({
                ...prev,
                lat: coords.lat,
                lng: coords.lng,
              }))
            }
          />

          {formData.lat && (
            <div className="coordenadas-info">
              <p>
                <strong>Ubicación fijada correctamente:</strong>
              </p>
              <p>
                Lat: {formData.lat.toFixed(6)} | Lng: {formData.lng.toFixed(6)}
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
              required={!modoEdicion || observaciones.obsUbicacion}
              disabled={modoEdicion && !observaciones.obsUbicacion}
            />
          </div>
        </div>

        <button type="submit" className="btn-enviar" disabled={enviando}>
          {enviando
            ? "Enviando..."
            : modoEdicion
              ? "Guardar Correcciones"
              : "Registrar Solicitud"}
        </button>

        <ModalAlerta
          modal={modal}
          cerrar={() => setModal({ ...modal, abierto: false })}
        />
      </form>
    </div>
  );
};

export default SolicitudComerciante;

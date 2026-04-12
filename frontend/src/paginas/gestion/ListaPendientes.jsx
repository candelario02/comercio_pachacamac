import React, { useEffect, useState } from "react";
import { ComercianteService } from "../../servicios/comerciantesApi";
import { AdminServicio } from "../../servicios/adminApi";
import { generarOrdenPagoPDF } from "../../herramientas/generadorDocumentos";
import {
  FaFileInvoiceDollar,
  FaCheck,
  FaEye,
  FaSync,
  FaIdCard,
} from "react-icons/fa";
import ModalAlerta from "../../componentes/comunes/ModalAlerta";
import "../../estilos/gestion-expedientes.css";

const ListaPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modalAlerta, setModalAlerta] = useState({
    abierto: false,
    mensaje: "",
    tipo: "",
    accion: null,
  });

  const [montoActividad, setMontoActividad] = useState(0);
  const [montoCarnet, setMontoCarnet] = useState(25);
  const [incluirCarnet, setIncluirCarnet] = useState(false);
  const [obsUbicacion, setObsUbicacion] = useState(false);
  const [obsCarnet, setObsCarnet] = useState(false);
  const [mensajeObservacion, setMensajeObservacion] = useState("");

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      const res = await ComercianteService.obtenerPendientes();
      const datosProcesados = Array.isArray(res.data)
        ? res.data.map((item) => ({
            ...item,
            telefono: item.telefono || "---",
            distrito: item.sector_nombre || "No especificado",
          }))
        : [];
      setSolicitudes(datosProcesados);
    } catch (err) {
      console.error("Error al cargar:", err);
    } finally {
      setCargando(false);
    }
  };
  const manejarEnviarObservacion = async () => {
    const idReal = seleccionado?.comerciante_id;

    if (!idReal) {
      setModalAlerta({
        abierto: true,
        mensaje: "No se pudo identificar el trámite.",
        tipo: "error",
      });
      return;
    }

    setModalAlerta({
      abierto: true,
      mensaje: "¿Confirmas el envío de estas observaciones?",
      tipo: "confirmar",
      accion: async () => {
        try {
          const token = localStorage.getItem("token");
          const datosEnvio = {
            estado_tramite: "observado",
            observaciones_admin: JSON.stringify({
              mensaje: mensajeObservacion,
              obsUbicacion: obsUbicacion,
              obsCarnet: obsCarnet,
            }),
          };

          const resultado = await AdminServicio.actualizarEstadoTramite(
            idReal,
            token,
            datosEnvio,
          );
          if (resultado.success) {
            setModalAlerta({
              abierto: true,
              mensaje: "✅ Trámite observado correctamente.",
              tipo: "exito",
              accion: () => {
                setModalAbierto(false);
                cargarSolicitudes();
              },
            });
          }
        } catch (error) {
          console.error("Error capturado:", error);
          setModalAlerta({
            abierto: true,
            mensaje: `❌ Error: ${error.message}`,
            tipo: "error",
          });
        }
      },
    });
  };

  const abrirDetalle = (s) => {
    setSeleccionado(s);
    setMontoActividad(parseFloat(s.costo_actividad) || 60);
    setIncluirCarnet(
      s.desea_tramitar_carnet === true || s.desea_tramitar_carnet === "true",
    );
    setModalAbierto(true);
  };

  const totalFinal =
    (parseFloat(montoActividad) || 0) +
    (incluirCarnet ? parseFloat(montoCarnet) || 0 : 0);

  const prepararAprobacion = (comerciante_id) => {
    const mActividad = parseFloat(montoActividad) || 0;
    const mCarnet = incluirCarnet ? parseFloat(montoCarnet) || 0 : 0;
    const montoFinalCalculado = mActividad + mCarnet;

    setModalAlerta({
      abierto: true,
      mensaje: `¿Aprobar trámite? Se generará una orden por S/ ${montoFinalCalculado.toFixed(2)}`,
      tipo: "confirmar",
      accion: async () => {
        try {
          const token = localStorage.getItem("token");
          const datosPago = {
            monto_confirmado: montoFinalCalculado,
            detalle: { actividad: mActividad, carnet: mCarnet },
          };
          const res = await AdminServicio.aprobarTramiteYGenerarDeuda(
            comerciante_id,
            token,
            datosPago,
          );
          if (res.success) {
            setModalAlerta({
              abierto: true,
              mensaje: `✅ ¡Éxito! Orden generada por S/ ${montoFinalCalculado.toFixed(2)}`,
              tipo: "aceptar",
              accion: () => {
                setModalAbierto(false);
                setModalAlerta({
                  abierto: false,
                  mensaje: "",
                  tipo: "",
                  accion: null,
                });
                cargarSolicitudes();
              },
            });
          } else {
            alert(res.mensaje || "Error al procesar la aprobación");
          }
        } catch (error) {
          console.error("Error al aprobar:", error);
          alert("Error de conexión con el servidor");
        }
      },
    });
  };

  return (
    <div className="gestion-contenedor">
      <header className="gestion-header-pro">
        <h2>Expedientes Pendientes</h2>
        <button onClick={cargarSolicitudes} className="btn-actualizar-circular">
          <FaSync className={cargando ? "spin" : ""} />
        </button>
      </header>

      <div className="tabla-card">
        <table className="tabla-gestion">
          <thead>
            <tr>
              <th>Expediente</th>
              <th>DNI/RUC</th>
              <th>Comerciante</th>
              <th>Teléfono</th>
              <th>Sector</th>
              <th>Actividad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length > 0 ? (
              solicitudes.map((s) => (
                <tr key={s.comerciante_id}>
                  <td>{s.numero_expediente}</td>
                  <td>{s.dni}</td>
                  <td className="comerciante-nombre">
                    {`${s.nombres} ${s.apellidos}`.toLowerCase()}
                  </td>

                  <td>{s.celular || "Sin número"}</td>
                  <td>{s.sector_nombre || "No asignado"}</td>
                  <td>{s.actividad_nombre}</td>
                  <td>
                    <button
                      className="btn-footer"
                      onClick={() => abrirDetalle(s)}
                    >
                      <FaEye /> Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="tabla-mensaje-estado">
                  {cargando
                    ? "Cargando solicitudes..."
                    : "No hay solicitudes pendientes en este momento."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && seleccionado && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>
                <FaIdCard /> Detalle: {seleccionado.nombres}
              </h3>
            </div>

            <div className="modal-body">
              <div className="detalle-seccion">
                <h4>Información del Comerciante</h4>
                <div className="info-grid">
                  <p>
                    <strong>Nombres:</strong> {seleccionado.nombres}{" "}
                    {seleccionado.apellidos}
                  </p>
                  <p>
                    <strong>DNI/RUC:</strong> {seleccionado.dni}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {seleccionado.celular || "S/N"}
                  </p>
                  <p>
                    <strong>Sector:</strong> {seleccionado.sector_nombre}
                  </p>
                  <p>
                    <strong>Foto Puesto:</strong>
                    {seleccionado.foto_puesto ? (
                      <button
                        className="btn-ver-foto"
                        onClick={() => {
                          const url = seleccionado?.foto_puesto;
                          if (!url) {
                            alert("No hay archivo.");
                            return;
                          }
                          window.open(url, "_blank");
                        }}
                      >
                        <FaEye /> Ver Foto Adjunta
                      </button>
                    ) : (
                      <span>No adjuntó foto</span>
                    )}
                  </p>

                  <p>
                    <strong>Ubicación:</strong> Lat: {seleccionado.lat} | Lng:{" "}
                    {seleccionado.lng}
                  </p>
                </div>
              </div>

              <div className="detalle-seccion">
                <h4>Requisitos de Actividad</h4>
                <div className="info-grid">
                  <p>
                    <strong>Actividad:</strong> {seleccionado.actividad_nombre}
                  </p>
                  <p>
                    <strong>Carnet de Sanidad:</strong>
                    {seleccionado.foto_carnet ? (
                      <button
                        className="btn-ver-foto"
                        onClick={() => {
                          const url = seleccionado?.foto_carnet;
                          if (!url) {
                            alert("No hay archivo.");
                            return;
                          }
                          window.open(url, "_blank");
                        }}
                      >
                        <FaEye /> Ver Foto Adjunta
                      </button>
                    ) : seleccionado.desea_tramitar_carnet ? (
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        ⚠️ Solicita trámite nuevo
                      </span>
                    ) : (
                      <span>No requiere / No adjunto</span>
                    )}
                  </p>
                </div>
              </div>
              <div
                className="detalle-seccion"
                style={{ borderLeft: "4px solid #f59e0b" }}
              >
                <h4>Fiscalización y Observaciones</h4>
                <div className="info-grid">
                  <label className="label-standard">
                    <input
                      type="checkbox"
                      className="check-inline"
                      checked={obsUbicacion}
                      onChange={(e) => setObsUbicacion(e.target.checked)}
                    />{" "}
                    Observar Ubicación / Foto Puesto
                  </label>
                  <label className="label-standard">
                    <input
                      type="checkbox"
                      className="check-inline"
                      checked={obsCarnet}
                      onChange={(e) => setObsCarnet(e.target.checked)}
                    />{" "}
                    Observar Carnet de Sanidad
                  </label>
                </div>
                <div className="input-field" style={{ marginTop: "10px" }}>
                  <label className="label-standard">
                    Detalle de la observación:
                  </label>
                  <textarea
                    className="input-standard"
                    rows="2"
                    placeholder="Ej: La ubicación es zona rígida o el carnet está borroso..."
                    value={mensajeObservacion}
                    onChange={(e) => setMensajeObservacion(e.target.value)}
                  />
                </div>
              </div>

              <div className="detalle-seccion activity-box">
                <h4>Liquidación de Pago</h4>
                <div className="info-grid">
                  <div className="input-field">
                    <label className="label-standard">
                      Derecho Trámite (S/):
                    </label>
                    <input
                      type="number"
                      className="input-standard"
                      value={montoActividad}
                      onChange={(e) => setMontoActividad(e.target.value)}
                    />
                  </div>
                  <div className="input-field">
                    <label className="label-standard">
                      <input
                        type="checkbox"
                        className="check-inline"
                        checked={incluirCarnet}
                        onChange={(e) => setIncluirCarnet(e.target.checked)}
                      />{" "}
                      Incluir Carnet (S/):
                    </label>
                    <input
                      type="number"
                      className="input-standard"
                      value={montoCarnet}
                      disabled={!incluirCarnet}
                      onChange={(e) => setMontoCarnet(e.target.value)}
                    />
                  </div>
                </div>
                <div className="total-liquidacion">
                  <strong>Total: S/ {totalFinal.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-footer"
                onClick={() => setModalAbierto(false)}
              >
                Cerrar
              </button>
              {(obsUbicacion || obsCarnet) && (
                <button
                  className="btn-ver-foto"
                  onClick={() => manejarEnviarObservacion(seleccionado.id)}
                >
                  <FaEye /> Observar Trámite
                </button>
              )}

              <button
                className="btn-orden-pago"
                onClick={async () =>
                  await generarOrdenPagoPDF(seleccionado, {
                    total: totalFinal,
                    derecho: montoActividad,
                    carnet: incluirCarnet ? montoCarnet : 0,
                  })
                }
              >
                <FaFileInvoiceDollar /> Generar Orden
              </button>

              <button
                className="btn-aprobar"
                onClick={() => prepararAprobacion(seleccionado.comerciante_id)}
              >
                <FaCheck /> Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="modal-alerta-overlay"
        style={{ display: modalAlerta.abierto ? "flex" : "none" }}
      >
        <ModalAlerta
          modal={modalAlerta}
          cerrar={() => setModalAlerta({ ...modalAlerta, abierto: false })}
        />
      </div>
    </div>
  );
};

export default ListaPendientes;

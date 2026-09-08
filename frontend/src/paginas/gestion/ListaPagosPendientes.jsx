import React, { useEffect, useState } from "react";
import { FaSync, FaCheckCircle,FaTimes, FaEye, FaCalendarAlt } from "react-icons/fa";
import "../../estilos/gestion-expedientes.css";
import { AdminServicio } from "../../servicios/adminApi";
import { BASE_URL } from "../../api/apiConfig";
import ModalAlerta from "../../componentes/comunes/ModalAlerta";

const ListaPagosPendientes = () => {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAlerta, setModalAlerta] = useState({
    abierto: false,
    mensaje: "",
    tipo: "",
    accion: null,
  });
  const [imagenExpandida, setImagenExpandida] = useState(null);

  const [mesesComercio, setMesesComercio] = useState(12);
  const [mesesSanidad, setMesesSanidad] = useState(6);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      const res = await AdminServicio.obtenerPagosPendientes(token);
      if (res && res.data && Array.isArray(res.data)) {
        setPagos(res.data);
      } else {
        setPagos([]);
      }
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      setPagos([]);
    } finally {
      setCargando(false);
    }
  };

  const verComprobante = (urlCloudinary) => {
    if (!urlCloudinary) {
      setModalAlerta({
        abierto: true,
        mensaje: "No hay archivo adjunto para este registro.",
        tipo: "info",
        accion: null,
      });
      return;
    }

    if (!urlCloudinary.startsWith("http")) {
      setModalAlerta({
        abierto: true,
        mensaje: "El archivo tiene un formato incompatible o está corrupto.",
        tipo: "info",
        accion: null,
      });
      return;
    }

    setImagenExpandida(urlCloudinary);
  };

  const handleConfirmarPago = (s) => {
    if (!s.voucher_url && !s.exento_pago) {
      setModalAlerta({
        abierto: true,
        mensaje:
          "⚠️ No se puede confirmar: El comerciante aún no ha subido el voucher de pago.",
        tipo: "aceptar",
      });
      return;
    }

    const mostrarSanidad = s.genera_sanidad === true;

    setModalAlerta({
      abierto: true,
      mensaje: (
        <div className="detalle-seccion">
          <p>
            ¿Validar formalización para <strong>{s.nombres}</strong>?
          </p>
          {s.exento_pago && (
            <p style={{ color: "orange", fontSize: "0.8rem" }}>
              * Registro Exonerado de Pago
            </p>
          )}
          <hr />
          <div className="info-grid">
            <div className="input-group">
              <label className="label-standard">
                <FaCalendarAlt /> Meses Comercio:
              </label>
              <input
                type="number"
                className="input-standard"
                defaultValue={mesesComercio}
                onChange={(e) => setMesesComercio(parseInt(e.target.value))}
                min="1"
                max="60"
              />
            </div>

            {mostrarSanidad ? (
              <div className="input-group">
                <label className="label-standard">
                  <FaCalendarAlt /> Meses Sanidad:
                </label>
                <input
                  type="number"
                  className="input-standard"
                  defaultValue={mesesSanidad}
                  onChange={(e) => setMesesSanidad(parseInt(e.target.value))}
                  min="1"
                  max="60"
                />
              </div>
            ) : (
              <div className="input-group">
                <label className="label-standard" style={{ color: "#dc3545" }}>
                  <FaCalendarAlt /> Sanidad:
                </label>
                <input
                  className="input-standard"
                  disabled
                  value="No aplica / Pago Externo"
                  style={{ backgroundColor: "#f8d7da", cursor: "not-allowed" }}
                />
              </div>
            )}
          </div>
        </div>
      ),
      tipo: "confirmar",
      accion: () => ejecutarConfirmacion(s),
    });
  };

  const ejecutarConfirmacion = async (s) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const datosConfirmacion = {
        monto_final: s.monto_pagado,
        dni_comerciante: s.dni,
        es_exonerado: s.exento_pago,
        vigencia_comercio: mesesComercio,
        vigencia_sanidad: mesesSanidad,
      };
      const respuesta = await AdminServicio.confirmarPago(
        s.id_pago,
        token,
        datosConfirmacion,
      );
      if (respuesta.success) {
        setModalAlerta({
          abierto: true,
          mensaje:
            "✅ ¡Operación exitosa! Carnets generados con la vigencia indicada.",
          tipo: "aceptar",
          accion: () => cargarPagos(),
        });
      } else {
        setModalAlerta({
          abierto: true,
          mensaje: "❌ Error: " + (respuesta.mensaje || "No se pudo procesar."),
          tipo: "aceptar",
        });
      }
    } catch (error) {
      console.error("Error crítico:", error);
      setModalAlerta({
        abierto: true,
        mensaje: "❌ Error de conexión.",
        tipo: "aceptar",
      });
    }
  };

  return (
    <div className="gestion-contenedor">
      {modalAlerta.abierto && (
        <div className="modal-alerta-overlay">
          <ModalAlerta
            modal={modalAlerta}
            cerrar={() => setModalAlerta({ ...modalAlerta, abierto: false })}
          />
        </div>
      )}
      {imagenExpandida && (
        <div
          className="modal-alerta-overlay"
          onClick={() => setImagenExpandida(null)}
        >
          <div
            className="visor-imagen-contenedor"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-cerrar-visor"
              onClick={() => setImagenExpandida(null)}
            >
              <FaTimes />
            </button>
            <img
              src={imagenExpandida}
              alt="Voucher"
              className="imagen-preview-full"
            />
          </div>
        </div>
      )}

      <header className="gestion-header-pro">
        <h2>Validación de Pagos</h2>
        <button
          onClick={cargarPagos}
          className="btn-actualizar-circular"
          disabled={cargando}
        >
          <FaSync className={cargando ? "spin" : ""} />
        </button>
      </header>

      <div className="tabla-card">
        <table className="tabla-gestion">
          <thead>
            <tr>
              <th>Expediente</th>
              <th>DNI</th>
              <th>Comerciante</th>
              <th>Monto</th>
              <th>N° Operación</th>
              <th>Voucher</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length > 0 ? (
              pagos.map((s) => (
                <tr key={s.id_pago}>
                  <td>{s.numero_expediente}</td>
                  <td>{s.dni}</td>
                  <td className="comerciante-nombre">
                    {`${s.nombres} ${s.apellidos}`.toLowerCase()}
                  </td>
                  <td>
                    <strong>
                      S/ {parseFloat(s.monto_pagado || 0).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span className="badge-operacion">
                      {s.numero_operacion || "---"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-ver-foto"
                      onClick={() => verComprobante(s.voucher_url)}
                    >
                      <FaEye /> Ver Foto
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-aprobar"
                      disabled={!s.voucher_url && !s.exento_pago}
                      onClick={() => handleConfirmarPago(s)}
                      title={
                        !s.voucher_url
                          ? "Esperando que el comerciante suba el voucher"
                          : "Confirmar Pago"
                      }
                      style={{
                        opacity: !s.voucher_url && !s.exento_pago ? 0.5 : 1,
                        cursor:
                          !s.voucher_url && !s.exento_pago
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Confirmar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="tabla-mensaje-estado">
                  {cargando ? "Cargando..." : "No hay pagos pendientes."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaPagosPendientes;

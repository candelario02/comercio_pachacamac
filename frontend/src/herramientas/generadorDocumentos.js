import jsPDF from "jspdf";
import QRCode from "qrcode";
import escudo from "../assets/imagenes/logos/selloparagenerardoc.png";

// función con logo en el QR
const agregarQRConLogo = async (doc, x, y, size, text) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    doc.addImage(qrDataUrl, "PNG", x, y, size, size);

    const logoSize = size * 0.25;
    const centroX = x + size / 2 - logoSize / 2;
    const centroY = y + size / 2 - logoSize / 2;
    doc.addImage(escudo, "PNG", centroX, centroY, logoSize, logoSize);
  } catch (err) {
    console.error("Error generando QR con logo:", err);
  }
};

// generador generarCarnetPDF formalizado
export const generarCarnetPDF = async (comerciante, tipo = "comercio") => {
  if (tipo === "sanidad") {
    return await generarCarnetSanidadPDF(comerciante);
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [90, 100],
  });

  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(1.5);
  doc.rect(5, 5, 80, 90);

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(escudo, "PNG", 25, 30, 40, 40);
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MUNICIPALIDAD DE PACHACÁMAC", 45, 12, { align: "center" });
  doc.text("CARNET DE COMERCIANTE", 45, 18, { align: "center" });

  let currentY = 32;
  const marginX = 15;
  const spacing = 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombres: ${comerciante.nombres.toUpperCase()}`, marginX, currentY);
  currentY += spacing;
  doc.text(
    `Apellidos: ${comerciante.apellidos.toUpperCase()}`,
    marginX,
    currentY,
  );
  currentY += spacing;
  doc.text(`DNI: ${comerciante.dni}`, marginX, currentY);
  currentY += spacing;
  doc.setTextColor(0, 102, 204);
  doc.setFont("helvetica", "bold");
  doc.text("Estado: APTO / FORMALIZADO", marginX, currentY);
  doc.setTextColor(0, 0, 0);
  currentY += spacing;

  doc.setFontSize(9);
  const fechaHoy = new Date();
  doc.text(
    `Emisión: ${fechaHoy.toLocaleDateString("es-PE")}`,
    marginX,
    currentY,
  );
  currentY += 6;

  let fVen;
  if (comerciante.fecha_vencimiento) {
    fVen = new Date(comerciante.fecha_vencimiento).toLocaleDateString("es-PE");
  } else {
    const fechaCalculada = new Date();
    fechaCalculada.setFullYear(fechaCalculada.getFullYear() + 1);
    fVen = fechaCalculada.toLocaleDateString("es-PE");
  }

  doc.text(`Vencimiento: ${fVen}`, marginX, currentY);

  const urlValidacion = `${window.location.origin}/validar?dni=${comerciante.dni}&tipo=comercio`;
  await agregarQRConLogo(doc, 35, 70, 20, urlValidacion);

  doc.save(`Carnet_Comercio_${comerciante.dni}.pdf`);
};

// generador generarCarnetSanidadPDF
export const generarCarnetSanidadPDF = async (comerciante) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [90, 100],
  });
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(1.5);
  doc.rect(5, 5, 80, 90);

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(escudo, "PNG", 25, 30, 40, 40);
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MUNICIPALIDAD DE PACHACÁMAC", 45, 12, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(34, 139, 34);
  doc.text("CARNET DE SANIDAD", 45, 18, { align: "center" });
  doc.setTextColor(0, 0, 0);

  let currentY = 32;
  const marginX = 15;
  const spacing = 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombres: ${comerciante.nombres.toUpperCase()}`, marginX, currentY);
  currentY += spacing;
  doc.text(
    `Apellidos: ${comerciante.apellidos.toUpperCase()}`,
    marginX,
    currentY,
  );
  currentY += spacing;
  doc.text(`DNI: ${comerciante.dni}`, marginX, currentY);
  currentY += spacing;

  doc.setTextColor(0, 100, 0);
  doc.setFont("helvetica", "bold");
  doc.text("ESTADO: APTO / SALUDABLE", marginX, currentY);
  doc.setTextColor(0, 0, 0);
  currentY += spacing;

  doc.setFontSize(9);
  const fechaHoy = new Date();
  doc.text(
    `Emisión: ${fechaHoy.toLocaleDateString("es-PE")}`,
    marginX,
    currentY,
  );
  currentY += 6;
  let fVen;
  if (comerciante.fecha_vencimiento_sanidad) {
    fVen = new Date(comerciante.fecha_vencimiento_sanidad).toLocaleDateString(
      "es-PE",
    );
  } else {
    const fechaCalculada = new Date();
    fechaCalculada.setMonth(fechaCalculada.getMonth() + 6);
    fVen = fechaCalculada.toLocaleDateString("es-PE");
  }

  doc.text(`Vencimiento: ${fVen}`, marginX, currentY);

  const urlValidacion = `${window.location.origin}/validar?dni=${comerciante.dni}&tipo=sanidad`;
  await agregarQRConLogo(doc, 35, 70, 20, urlValidacion);

  doc.save(`Carnet_Sanidad_${comerciante.dni}.pdf`);
};

// generador generarOrdenPagoPDF
export const generarOrdenPagoPDF = async (comerciante, montos) => {
  const { total, derecho, carnet } = montos;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [100, 160], 
  });

  doc.setTextColor(240, 240, 240); 
  doc.setFontSize(25);
  doc.setFont("helvetica", "bold");
  doc.text("MUNICIPALIDAD DE PACHACÁMAC", 50, 80, { 
    align: "center", 
    angle: 45 
  });

  doc.addImage(escudo, "PNG", 40, 8, 20, 20);
  
  doc.setTextColor(0, 139, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MUNICIPALIDAD DISTRITAL DE PACHACÁMAC", 50, 32, { align: "center" });
  doc.text("GERENCIA DE DESARROLLO ECONÓMICO", 50, 37, { align: "center" });

  let currentY = 48;
  const marginX = 10;
  const valueX = 65;
  const spacing = 7;

  doc.setDrawColor(0, 139, 163);
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY - 5, 90, currentY - 5);
  
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text("ORDEN DE PAGO", 50, currentY, { align: "center" });
  currentY += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Comerciante:", marginX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${comerciante.nombres} ${comerciante.apellidos}`.toUpperCase(), 32, currentY);
  currentY += spacing;

  doc.setFont("helvetica", "bold");
  doc.text("DNI / RUC:", marginX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(String(comerciante.dni), valueX, currentY);
  currentY += 8;

  doc.setFillColor(245, 245, 245);
  doc.rect(marginX, currentY - 4, 80, 28, 'F');
  doc.text("Derecho de Trámite:", marginX + 2, currentY);
  doc.text(`S/ ${parseFloat(derecho).toFixed(2)}`, valueX, currentY);
  currentY += spacing;

  doc.text("Carnet de Sanidad:", marginX + 2, currentY);
  doc.text(`S/ ${parseFloat(carnet).toFixed(2)}`, valueX, currentY);
  currentY += spacing;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 102, 204);
  doc.text("TOTAL A PAGAR:", marginX + 2, currentY);
  doc.text(`S/ ${parseFloat(total).toFixed(2)}`, valueX, currentY);
  currentY += 10;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Estimado comerciante, le invitamos a acercarse a las ventanillas", 50, currentY, { align: "center" });
  doc.text("de Tesorería para su pago correspondiente.", 50, currentY + 4, { align: "center" });
  
  currentY += 12;
  doc.setTextColor(231, 76, 60); 
  doc.setFont("helvetica", "bold");
  doc.text(`Válido hasta: ${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}`, 50, currentY, { align: "center" });

  const dataPago = `PAGO|${comerciante.dni}|${total}|${new Date().getTime()}`;
  await agregarQRConLogo(doc, 35, currentY + 5, 30, dataPago);

  doc.save(`Orden_${comerciante.dni}.pdf`);
};

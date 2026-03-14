import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import escudo from '../assets/imagenes/logos/selloparagenerardoc.png'; 

const VIGENCIA_MESES = 12;

export const generarCarnetPDF = async (comerciante) => {
    // tamano
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [90, 100] });

    // marco
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, 80, 90); 

    // marca de agua de fondo
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.addImage(escudo, 'PNG', 25, 30, 40, 40);
    doc.setGState(new doc.GState({ opacity: 1 }));

    // titulos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text('MUNICIPALIDAD DE PACHACAMAC', 45, 12, { align: 'center' });
    doc.text('CARNET DE COMERCIANTE', 45, 18, { align: 'center' });


    let currentY = 30; 
    const marginX = 15; 
    const spacing = 8;  

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

   
    doc.text(`Nombres: ${comerciante.nombres.toUpperCase()}`, marginX, currentY);
    currentY += spacing;

   
    doc.text(`Dni: ${comerciante.dni}`, marginX, currentY);
    currentY += spacing;

    
    doc.setTextColor(0, 128, 0);
    doc.setFont("helvetica", "bold");
    doc.text('Estado: FORMALIZADO (OK)', marginX, currentY); 
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    currentY += spacing;

    
    doc.setFontSize(9);
    doc.text(`Fecha emisión: ${new Date().toLocaleDateString()}`, marginX, currentY);
    currentY += spacing;

    
    const fVen = new Date();
    fVen.setMonth(fVen.getMonth() + 6);
    doc.text(`Fecha vencimiento: ${fVen.toLocaleDateString()}`, marginX, currentY);

    // para validar el QR
    const urlValidacion = `https://pachacamac.gob.pe/validar?dni=${comerciante.dni}`;
    try {
        const qrDataUrl = await QRCode.toDataURL(urlValidacion, { width: 150, margin: 1 });
      
        doc.addImage(qrDataUrl, 'PNG', 35, 70, 20, 20); 
    } catch (err) {
        console.error("Error QR:", err);
    }

    doc.save(`Carnet_${comerciante.dni}.pdf`);

};

export const generarOrdenPagoPDF = async (comerciante, montos) => {
    const { total, derecho, carnet } = montos;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 150] });

    
    doc.addImage(escudo, 'PNG', 40, 10, 20, 20);

    let currentY = 38;
    const marginX = 10;
    const valueX = 65; 
    const spacing = 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('ORDEN DE PAGO', 50, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(9);
    
    doc.text("Comerciante:", marginX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${comerciante.nombres} ${comerciante.apellidos}`.toUpperCase(), 35, currentY);
    currentY += spacing;

    doc.setFont("helvetica", "bold");
    doc.text("DNI / RUC:", marginX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(String(comerciante.dni), valueX, currentY);
    currentY += spacing;

   
    doc.line(marginX, currentY, 90, currentY); 
    currentY += 5;

    doc.text("Derecho de Trámite:", marginX, currentY);
    doc.text(`S/ ${parseFloat(derecho).toFixed(2)}`, valueX, currentY);
    currentY += spacing;

    doc.text("Carnet de Sanidad:", marginX, currentY);
    doc.text(`S/ ${parseFloat(carnet).toFixed(2)}`, valueX, currentY);
    currentY += spacing;

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", marginX, currentY);
    doc.text(`S/ ${parseFloat(total).toFixed(2)}`, valueX, currentY);
    currentY += spacing;
    doc.line(marginX, currentY, 90, currentY);

    currentY += 10;
    doc.setFontSize(8);
    doc.text("Válido por 3 días hábiles.", marginX, currentY);
    
    try {
        const qrDataUrl = await QRCode.toDataURL(`PAGO-${comerciante.dni}-${total}`, { width: 100, margin: 1 });
        doc.addImage(qrDataUrl, 'PNG', 35, currentY + 10, 30, 30);
    } catch (err) { console.error("Error QR:", err); }

    doc.save(`Orden_${comerciante.dni}.pdf`);
};
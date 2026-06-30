import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function downloadBillPdf(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");
  const pageW = 210;
  const pageH = 297;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Preserve aspect ratio but scale to use full page height first.
  // This avoids large blank space at the bottom.
  let renderH = pageH;
  let renderW = (canvas.width * renderH) / canvas.height;

  // If width becomes too large, fit to width instead.
  if (renderW > pageW) {
    renderW = pageW;
    renderH = (canvas.height * renderW) / canvas.width;
  }

  const x = (pageW - renderW) / 2;
  pdf.addImage(imgData, "PNG", x, 0, renderW, renderH, undefined, "FAST");
  pdf.save(filename);
}

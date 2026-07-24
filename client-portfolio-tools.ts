import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
// @ts-ignore PDF.js publishes ESM browser types separately from this build entry.
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

type PdfRenderState = {
  pdf: any;
  page: number;
  zoom: number;
};

function setStatus(container: HTMLElement, message: string) {
  const status = container.querySelector<HTMLElement>('[data-pdf-status]');
  if (status) status.textContent = message;
}

async function drawPdfPage(container: HTMLElement, state: PdfRenderState) {
  const canvas = container.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas) return;
  const page = await state.pdf.getPage(state.page);
  const maxWidth = Math.min(window.innerWidth * 0.88, 920);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.max(0.6, Math.min(state.zoom, maxWidth / base.width));
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  setStatus(container, `Page ${state.page} of ${state.pdf.numPages}`);
  const previous = container.querySelector<HTMLButtonElement>('[data-pdf-prev]');
  const next = container.querySelector<HTMLButtonElement>('[data-pdf-next]');
  if (previous) previous.disabled = state.page <= 1;
  if (next) next.disabled = state.page >= state.pdf.numPages;
}

async function renderPdfPreview(container: HTMLElement, url: string) {
  container.innerHTML = `<div class="mobile-pdf-viewer"><div class="mobile-pdf-controls"><button type="button" data-pdf-prev>← Previous</button><span data-pdf-status>Loading PDF…</span><button type="button" data-pdf-next>Next →</button><button type="button" data-pdf-zoom-out>−</button><button type="button" data-pdf-zoom-in>+</button></div><div class="mobile-pdf-canvas-wrap"><canvas></canvas></div></div>`;
  try {
    const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
    const state: PdfRenderState = { pdf, page: 1, zoom: 1.35 };
    container.querySelector('[data-pdf-prev]')?.addEventListener('click', async () => {
      if (state.page > 1) { state.page -= 1; await drawPdfPage(container, state); }
    });
    container.querySelector('[data-pdf-next]')?.addEventListener('click', async () => {
      if (state.page < state.pdf.numPages) { state.page += 1; await drawPdfPage(container, state); }
    });
    container.querySelector('[data-pdf-zoom-out]')?.addEventListener('click', async () => {
      state.zoom = Math.max(0.6, state.zoom - 0.2); await drawPdfPage(container, state);
    });
    container.querySelector('[data-pdf-zoom-in]')?.addEventListener('click', async () => {
      state.zoom = Math.min(3, state.zoom + 0.2); await drawPdfPage(container, state);
    });
    await drawPdfPage(container, state);
  } catch (error) {
    console.error('PDF preview error', error);
    container.innerHTML = `<iframe src="${url}" title="PDF preview"></iframe>`;
  }
}

function hideUiForCapture() {
  document.body.classList.add('pdf-exporting');
  return () => document.body.classList.remove('pdf-exporting');
}

async function captureElement(element: HTMLElement) {
  return html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: document.documentElement.scrollWidth,
  });
}

function addCanvasAsPages(pdf: jsPDF, canvas: HTMLCanvasElement, firstPage: boolean) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const scale = usableWidth / canvas.width;
  const sourcePageHeight = Math.floor(usableHeight / scale);
  let sourceY = 0;
  let pageIndex = 0;
  while (sourceY < canvas.height) {
    if (!firstPage || pageIndex > 0) pdf.addPage();
    const cropHeight = Math.min(sourcePageHeight, canvas.height - sourceY);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = cropHeight;
    pageCanvas.getContext('2d')?.drawImage(canvas, 0, sourceY, canvas.width, cropHeight, 0, 0, canvas.width, cropHeight);
    const imageHeight = cropHeight * scale;
    pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, usableWidth, imageHeight, undefined, 'FAST');
    sourceY += cropHeight;
    pageIndex += 1;
  }
}

async function exportPortfolioPdf(mode: 'sections' | 'long' | 'direct') {
  const restore = hideUiForCapture();
  try {
    if (mode === 'long') {
      const canvas = await captureElement(document.body);
      const scale = Math.min(1, 14000 / canvas.width, 14000 / canvas.height);
      const width = Math.max(1, Math.round(canvas.width * scale));
      const height = Math.max(1, Math.round(canvas.height * scale));
      const pdf = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'px', format: [width, height] });
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, width, height, undefined, 'FAST');
      pdf.save('umair-ahmad-full-portfolio-one-page.pdf');
      return;
    }
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let first = true;
    for (const section of sections) {
      const canvas = await captureElement(section);
      addCanvasAsPages(pdf, canvas, first);
      first = false;
    }
    pdf.save(mode === 'sections' ? 'umair-ahmad-portfolio-section-pages.pdf' : 'umair-ahmad-portfolio-direct.pdf');
  } finally {
    restore();
  }
}

declare global {
  interface Window {
    PortfolioTools?: {
      renderPdfPreview: (container: HTMLElement, url: string) => Promise<void>;
      exportPortfolioPdf: (mode: 'sections' | 'long' | 'direct') => Promise<void>;
    };
  }
}

window.PortfolioTools = { renderPdfPreview, exportPortfolioPdf };

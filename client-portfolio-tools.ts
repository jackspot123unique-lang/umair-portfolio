// @ts-ignore PDF.js publishes ESM browser types separately from this build entry.
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

type PdfRenderState = { pdf: any; page: number; zoom: number };
type PdfNavigation = { previous: () => Promise<void>; next: () => Promise<void> };
let activePdfNavigation: PdfNavigation | null = null;

function setStatus(container: HTMLElement, message: string) {
  const status = container.querySelector<HTMLElement>('[data-pdf-status]');
  if (status) status.textContent = message;
}

async function drawPdfPage(container: HTMLElement, state: PdfRenderState) {
  const canvas = container.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas) return;
  const page = await state.pdf.getPage(state.page);
  const maxWidth = Math.min(window.innerWidth * 0.95, 1400);
  const maxHeight = Math.max(350, window.innerHeight - 145);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.max(0.55, Math.min(state.zoom, maxWidth / base.width, maxHeight / base.height * 1.8));
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
  const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
  const state: PdfRenderState = { pdf, page: 1, zoom: 1.35 };
  const previous = async () => { if (state.page > 1) { state.page -= 1; await drawPdfPage(container, state); } };
  const next = async () => { if (state.page < state.pdf.numPages) { state.page += 1; await drawPdfPage(container, state); } };
  activePdfNavigation = { previous, next };
  container.querySelector('[data-pdf-prev]')?.addEventListener('click', previous);
  container.querySelector('[data-pdf-next]')?.addEventListener('click', next);
  container.querySelector('[data-pdf-zoom-out]')?.addEventListener('click', async () => {
    state.zoom = Math.max(0.55, state.zoom - 0.2); await drawPdfPage(container, state);
  });
  container.querySelector('[data-pdf-zoom-in]')?.addEventListener('click', async () => {
    state.zoom = Math.min(3, state.zoom + 0.2); await drawPdfPage(container, state);
  });
  await drawPdfPage(container, state);
}

window.addEventListener('keydown', event => {
  const previewOpen = document.getElementById('fsOverlay')?.classList.contains('open');
  if (!previewOpen || !activePdfNavigation) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); void activePdfNavigation.previous(); }
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); void activePdfNavigation.next(); }
});

declare global {
  interface Window {
    PortfolioTools?: {
      renderPdfPreview: (container: HTMLElement, url: string) => Promise<void>;
      clearPdfPreview: () => void;
    };
  }
}
window.PortfolioTools = { renderPdfPreview, clearPdfPreview: () => { activePdfNavigation = null; } };

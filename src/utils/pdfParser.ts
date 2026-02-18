import type { TurmaData } from '../types/schedule';
import { parseSigaaText, enriquecerTurmas } from './sigaaParser';
import { SEMESTRES_DIREITO } from '../data/semestres';

/**
 * Carrega o worker do pdf.js a partir do CDN (evita problema de bundling).
 * Chamado uma única vez antes de usar o pdf.js.
 */
async function getPdfjsLib() {
  // Importação dinâmica do pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  // Worker via URL do CDN para evitar problemas de bundling no Vite
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

/**
 * Extrai todo o texto de um arquivo PDF usando pdf.js.
 */
async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await getPdfjsLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? (item.str ?? '') : ''))
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n');
}

/**
 * Processa um File de PDF do SIGAA e retorna as turmas parseadas.
 * @param file O arquivo PDF selecionado pelo usuário
 * @param onProgress Callback com progresso (0–1)
 */
export async function processarPdfSigaa(
  file: File,
  onProgress?: (progress: number) => void
): Promise<TurmaData[]> {
  onProgress?.(0.1);
  const text = await extractTextFromPdf(file);
  onProgress?.(0.7);
  const raws = parseSigaaText(text);
  onProgress?.(0.9);
  const turmas = enriquecerTurmas(raws, SEMESTRES_DIREITO);
  onProgress?.(1.0);
  return turmas;
}

import React, { useState, useEffect, useRef } from 'react';
import type { TurmaData } from '../types/schedule';
import { corParaCodigo } from '../utils/colors';

interface ModalCompartilharProps {
  turmasSelecionadas: TurmaData[];
  gradeRef: React.RefObject<HTMLDivElement | null>;
  onFechar: () => void;
}

// ──────────────────────────────────────────────────────
// Constantes da grade visual (em pixels no canvas 1920×1080)
// ──────────────────────────────────────────────────────
const W = 1920;
const H = 1080;

const DIAS_LABEL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const BLOCOS_LABEL: Record<string, string> = {
  M1: '07:00', M2: '07:55', M3: '08:50', M4: '09:45', M5: '10:40', M6: '11:35',
  T1: '13:00', T2: '13:55', T3: '14:50', T4: '15:45', T5: '16:40', T6: '17:35',
  N1: '18:30', N2: '19:25', N3: '20:20', N4: '21:15',
};
const TURNOS: { label: string; blocos: string[]; cor: string }[] = [
  { label: 'Manhã',  blocos: ['M1','M2','M3','M4','M5','M6'], cor: '#f59e0b' },
  { label: 'Tarde',  blocos: ['T1','T2','T3','T4','T5','T6'], cor: '#3b82f6' },
  { label: 'Noite',  blocos: ['N1','N2','N3','N4'],           cor: '#7c3aed' },
];

// Converte cor hex para rgba com alpha
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Quebra texto em múltiplas linhas dado um maxWidth
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function gerarImagemCanvas(turmasSelecionadas: TurmaData[]): string {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Fundo ──────────────────────────────────────────
  ctx.fillStyle = '#0f0f11';
  ctx.fillRect(0, 0, W, H);

  // ── Header ─────────────────────────────────────────
  const HEADER_H = 72;
  ctx.fillStyle = '#161618';
  ctx.fillRect(0, 0, W, HEADER_H);
  // Linha inferior do header
  ctx.strokeStyle = '#2a2a2e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HEADER_H);
  ctx.lineTo(W, HEADER_H);
  ctx.stroke();

  // Logo pill
  const PILL_X = 32, PILL_Y = 16, PILL_W = 40, PILL_H = 40, PILL_R = 10;
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.roundRect(PILL_X, PILL_Y, PILL_W, PILL_H, PILL_R);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', PILL_X + PILL_W / 2, PILL_Y + PILL_H / 2);

  // Título
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('Meu Horário Direito', PILL_X + PILL_W + 14, 38);
  ctx.fillStyle = '#6b7280';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('FADIR · UFBA · 2026.1', PILL_X + PILL_W + 14, 58);

  // Contagem de disciplinas (direita)
  const disciplinasLabel = `${turmasSelecionadas.length} disciplina${turmasSelecionadas.length !== 1 ? 's' : ''} selecionada${turmasSelecionadas.length !== 1 ? 's' : ''}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(disciplinasLabel, W - 32, 38);

  // URL discreta
  ctx.fillStyle = '#4b5563';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('roxgrupos.cloud/horarios', W - 32, 58);

  ctx.textAlign = 'left';

  // ── Layout da grade ─────────────────────────────────
  const MARGIN_LEFT = 20;
  const MARGIN_RIGHT = 20;
  const MARGIN_TOP = HEADER_H + 12;
  const MARGIN_BOTTOM = 16;

  // Área disponível para a grade
  const GRADE_X = MARGIN_LEFT;
  const GRADE_Y = MARGIN_TOP;
  const GRADE_W = W - MARGIN_LEFT - MARGIN_RIGHT;
  const GRADE_H = H - MARGIN_TOP - MARGIN_BOTTOM;

  // Coluna de horário
  const COL_HORA_W = 68;
  // Colunas dos dias (6 dias)
  const N_DIAS = 6;
  const COL_DIA_W = (GRADE_W - COL_HORA_W) / N_DIAS;

  // Linhas de turnos (faixa de turno + blocos)
  // Total de blocos: 6+6+4 = 16, mais 3 linhas de cabeçalho de turno
  const TOTAL_ROWS = 16 + 3; // blocos + faixas de turno
  const ROW_HEADER_H = 32; // cabeçalho "Horário / Dias"
  const ROW_TURNO_H = 20; // faixa de nome do turno
  const ROW_BLOCO_H = (GRADE_H - ROW_HEADER_H - 3 * ROW_TURNO_H) / 16;

  // ── Fundo da grade ──────────────────────────────────
  ctx.fillStyle = '#1a1a1e';
  ctx.beginPath();
  ctx.roundRect(GRADE_X, GRADE_Y, GRADE_W, GRADE_H, 12);
  ctx.fill();
  ctx.strokeStyle = '#2a2a2e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(GRADE_X, GRADE_Y, GRADE_W, GRADE_H, 12);
  ctx.stroke();

  // ── Cabeçalho da grade (dias da semana) ─────────────
  ctx.fillStyle = '#161618';
  ctx.beginPath();
  ctx.roundRect(GRADE_X, GRADE_Y, GRADE_W, ROW_HEADER_H, [12, 12, 0, 0]);
  ctx.fill();

  // "Horário"
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Horário', GRADE_X + COL_HORA_W / 2, GRADE_Y + ROW_HEADER_H / 2);

  // Nome dos dias
  for (let d = 0; d < N_DIAS; d++) {
    const x = GRADE_X + COL_HORA_W + d * COL_DIA_W;
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(DIAS_LABEL[d], x + COL_DIA_W / 2, GRADE_Y + ROW_HEADER_H / 2);

    // Separador vertical
    if (d > 0) {
      ctx.strokeStyle = '#2a2a2e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, GRADE_Y);
      ctx.lineTo(x, GRADE_Y + GRADE_H);
      ctx.stroke();
    }
  }

  // Separador vertical após coluna de hora
  ctx.strokeStyle = '#2a2a2e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GRADE_X + COL_HORA_W, GRADE_Y);
  ctx.lineTo(GRADE_X + COL_HORA_W, GRADE_Y + GRADE_H);
  ctx.stroke();

  // Linha separadora do cabeçalho
  ctx.beginPath();
  ctx.moveTo(GRADE_X, GRADE_Y + ROW_HEADER_H);
  ctx.lineTo(GRADE_X + GRADE_W, GRADE_Y + ROW_HEADER_H);
  ctx.stroke();

  // ── Monta índice grade (dia-bloco → turma) ───────────
  const gradeIndex: Record<string, TurmaData> = {};
  for (const t of turmasSelecionadas) {
    for (const h of t.horarios) {
      const key = `${h.dia}-${h.bloco}`;
      gradeIndex[key] = t;
    }
  }

  // ── Desenha blocos e células ─────────────────────────
  let currentY = GRADE_Y + ROW_HEADER_H;

  for (const turno of TURNOS) {
    // Faixa do turno
    ctx.fillStyle = hexAlpha(turno.cor, 0.08);
    ctx.fillRect(GRADE_X, currentY, GRADE_W, ROW_TURNO_H);
    ctx.fillStyle = turno.cor;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(turno.label.toUpperCase(), GRADE_X + 10, currentY + ROW_TURNO_H / 2);

    // Linha inferior do turno
    ctx.strokeStyle = '#2a2a2e';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(GRADE_X, currentY + ROW_TURNO_H);
    ctx.lineTo(GRADE_X + GRADE_W, currentY + ROW_TURNO_H);
    ctx.stroke();

    currentY += ROW_TURNO_H;

    for (const bloco of turno.blocos) {
      const rowH = ROW_BLOCO_H;

      // Fundo da linha de bloco (alternado leve)
      ctx.fillStyle = 'rgba(255,255,255,0.01)';
      ctx.fillRect(GRADE_X, currentY, GRADE_W, rowH);

      // Coluna de hora
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(bloco, GRADE_X + COL_HORA_W / 2, currentY + rowH / 2 - 7);
      ctx.fillStyle = '#4b5563';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(BLOCOS_LABEL[bloco] ?? '', GRADE_X + COL_HORA_W / 2, currentY + rowH / 2 + 7);

      // Células dos dias
      for (let d = 0; d < N_DIAS; d++) {
        const cellX = GRADE_X + COL_HORA_W + d * COL_DIA_W;
        const cellY = currentY;
        const cellW = COL_DIA_W;
        const cellH = rowH;
        const CELL_PAD = 4;

        const key = `${DIAS_LABEL[d]}-${bloco}`;
        const turma = gradeIndex[key];

        if (turma) {
          const cor = corParaCodigo(turma.codigo);

          // Fundo colorido
          ctx.fillStyle = hexAlpha(cor, 0.22);
          ctx.beginPath();
          ctx.roundRect(cellX + CELL_PAD, cellY + CELL_PAD, cellW - CELL_PAD * 2, cellH - CELL_PAD * 2, 6);
          ctx.fill();

          // Borda
          ctx.strokeStyle = hexAlpha(cor, 0.45);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cellX + CELL_PAD, cellY + CELL_PAD, cellW - CELL_PAD * 2, cellH - CELL_PAD * 2, 6);
          ctx.stroke();

          // Barra lateral esquerda
          ctx.fillStyle = cor;
          ctx.beginPath();
          ctx.roundRect(cellX + CELL_PAD, cellY + CELL_PAD + 4, 3, cellH - CELL_PAD * 2 - 8, 2);
          ctx.fill();

          // Código da disciplina
          const textX = cellX + CELL_PAD + 8;
          const availW = cellW - CELL_PAD * 2 - 10;

          ctx.fillStyle = cor;
          ctx.font = `bold ${Math.min(12, Math.max(9, cellW / 10))}px system-ui, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(turma.codigo, textX, cellY + CELL_PAD + 5, availW);

          // Nome (pode quebrar)
          const nomeY = cellY + CELL_PAD + 5 + 14;
          const remainH = cellH - CELL_PAD * 2 - 19 - 12;
          const fontSize = Math.min(10, Math.max(8, cellW / 14));
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.font = `${fontSize}px system-ui, sans-serif`;
          const nomeLines = wrapText(ctx, turma.nome, availW);
          let lineCount = 0;
          for (const line of nomeLines) {
            if (lineCount * (fontSize + 2) >= remainH) break;
            ctx.fillText(line, textX, nomeY + lineCount * (fontSize + 2), availW);
            lineCount++;
          }

          // Turma badge (rodapé)
          ctx.fillStyle = hexAlpha(cor, 0.6);
          ctx.font = `bold ${Math.min(9, Math.max(8, cellW / 16))}px system-ui, sans-serif`;
          ctx.fillText(`T${turma.turma}`, textX, cellY + cellH - CELL_PAD - 11, availW);
        }

        // Separador vertical da célula (leve)
        if (d < N_DIAS - 1) {
          ctx.strokeStyle = '#2a2a2e';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cellX + cellW, currentY);
          ctx.lineTo(cellX + cellW, currentY + rowH);
          ctx.stroke();
        }
      }

      // Linha separadora horizontal
      ctx.strokeStyle = '#222226';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(GRADE_X, currentY + rowH);
      ctx.lineTo(GRADE_X + GRADE_W, currentY + rowH);
      ctx.stroke();

      currentY += rowH;
    }
  }

  // ── Legenda (lista de disciplinas) rodapé ───────────
  // Não tem espaço na grade 1080p, mas vamos verificar se sobra altura
  // (se a grade ficou menor que H - MARGIN_BOTTOM, não mostramos legenda extra)

  return canvas.toDataURL('image/png');
}

export function ModalCompartilhar({ turmasSelecionadas, gradeRef: _gradeRef, onFechar }: ModalCompartilharProps) {
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(true);
  const [erroImagem, setErroImagem] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Monta a URL compartilhável com hash
  const hashValue = turmasSelecionadas.map(t => `${t.codigo}~${t.turma}`).join(',');
  const url = `${window.location.origin}${window.location.pathname}#grade=${hashValue}`;

  // Gera imagem via Canvas ao montar
  useEffect(() => {
    try {
      const dataUrl = gerarImagemCanvas(turmasSelecionadas);
      setImagemUrl(dataUrl);
    } catch (e) {
      console.error('Erro ao gerar imagem:', e);
      setErroImagem(true);
    } finally {
      setGerando(false);
    }
  }, [turmasSelecionadas]);

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onFechar]);

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      const input = document.getElementById('share-url-input') as HTMLInputElement | null;
      input?.select();
    }
  }

  function handleBaixar() {
    if (!imagemUrl) return;
    const a = document.createElement('a');
    a.href = imagemUrl;
    a.download = 'meu-horario-direito-2026-1.png';
    a.click();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) onFechar();
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
    >
      <div className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden animate-slide-up">
        {/* Header do modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <h2 className="text-white font-bold text-base">Compartilhar grade</h2>
          </div>
          <button
            onClick={onFechar}
            className="text-muted hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-4 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Seção: Link compartilhável */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Link para compartilhar
            </p>
            <p className="text-xs text-white/50 mb-3">
              Qualquer pessoa que abrir este link verá a grade montada com as{' '}
              <strong className="text-white/70">{turmasSelecionadas.length} disciplina{turmasSelecionadas.length !== 1 ? 's' : ''}</strong>{' '}
              selecionadas.
            </p>
            <div className="flex gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={url}
                onClick={e => (e.target as HTMLInputElement).select()}
                className="flex-1 bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs text-white/70 font-mono truncate cursor-pointer focus:outline-none focus:border-accent/60"
              />
              <button
                onClick={handleCopiar}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  copiado
                    ? 'bg-success/20 border border-success/40 text-success'
                    : 'bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30'
                }`}
              >
                {copiado ? '✓ Copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Seção: Imagem da grade */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Imagem da grade
                </p>
                <p className="text-[11px] text-white/30 mt-0.5">
                  Resolução 1920×1080 · PNG
                </p>
              </div>
              {!gerando && imagemUrl && (
                <button
                  onClick={handleBaixar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
                >
                  <span>⬇️</span>
                  Baixar PNG
                </button>
              )}
            </div>

            {gerando && (
              <div className="flex items-center gap-3 py-8 justify-center text-muted">
                <div className="w-5 h-5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                <span className="text-sm">Gerando imagem...</span>
              </div>
            )}

            {!gerando && erroImagem && (
              <p className="text-xs text-muted/60 py-4 text-center">
                Não foi possível gerar a imagem da grade.
              </p>
            )}

            {!gerando && imagemUrl && (
              <div className="rounded-xl overflow-hidden border border-border/50 bg-surface-3">
                <img
                  src={imagemUrl}
                  alt="Preview da grade — 1920×1080"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '340px', objectPosition: 'top' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

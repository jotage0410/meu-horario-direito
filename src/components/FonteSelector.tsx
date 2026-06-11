import { useState, useRef, useEffect } from 'react';
import type { TurmaData } from '../types/schedule';
import { UploadPDF } from './UploadPDF';
import { CONFIG } from '../config';

interface FonteSelectorProps {
  onTurmasUpload: (turmas: TurmaData[]) => void;
  totalTurmasAtuais: number;
}

export function FonteSelector({ onTurmasUpload, totalTurmasAtuais }: FonteSelectorProps) {
  const [painelAberto, setPainelAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!painelAberto) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPainelAberto(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [painelAberto]);

  function handleUpload(turmas: TurmaData[]) {
    onTurmasUpload(turmas);
    setPainelAberto(false);
  }

  return (
    <div ref={containerRef} className="relative flex items-center justify-between gap-4">
      {/* Pill de status — dados atuais */}
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 border border-success/30 text-success whitespace-nowrap">
          ✓ {CONFIG.SEMESTRE} atualizado
        </span>
        <span className="text-xs text-muted hidden sm:inline">
          {totalTurmasAtuais} turmas · FADIR
        </span>
      </div>

      {/* Botão PDF discreto */}
      <button
        onClick={() => setPainelAberto(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors whitespace-nowrap ${
          painelAberto
            ? 'border-accent/60 text-accent bg-accent/10'
            : 'border-border text-muted hover:border-accent/50 hover:text-white'
        }`}
      >
        <span>📤</span>
        <span>Enviar PDF</span>
        <span className={`text-[10px] transition-transform duration-200 ${painelAberto ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Dropdown com UploadPDF */}
      {painelAberto && (
        <div className="absolute right-0 top-full mt-2 w-[480px] max-w-[calc(100vw-2rem)] z-30
                        bg-surface-2 border border-border rounded-xl shadow-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Enviar PDF do SIGAA</p>
            <p className="text-xs text-muted">Para semestres futuros</p>
          </div>
          <UploadPDF onTurmasCarregadas={handleUpload} />
        </div>
      )}
    </div>
  );
}

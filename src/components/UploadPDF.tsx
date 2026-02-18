import { useRef, useState } from 'react';
import type { TurmaData } from '../types/schedule';
import { processarPdfSigaa } from '../utils/pdfParser';

interface UploadPDFProps {
  onTurmasCarregadas: (turmas: TurmaData[]) => void;
}

export function UploadPDF({ onTurmasCarregadas }: UploadPDFProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function processar(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErro('Por favor, envie um arquivo PDF do SIGAA.');
      return;
    }

    setLoading(true);
    setErro(null);
    setProgresso(0);
    setFileName(file.name);

    try {
      const turmas = await processarPdfSigaa(file, p => setProgresso(Math.round(p * 100)));
      if (turmas.length === 0) {
        setErro('Nenhuma turma encontrada no PDF. Certifique-se de que é um relatório de turmas do SIGAA.');
      } else {
        onTurmasCarregadas(turmas);
      }
    } catch (e) {
      setErro('Erro ao processar o PDF. Tente novamente com um relatório de turmas do SIGAA.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleFile(files: FileList | null) {
    if (files && files[0]) processar(files[0]);
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => handleFile(e.target.files)}
      />

      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files);
        }}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${dragging ? 'border-accent bg-accent/10 scale-[1.01]' : 'border-border hover:border-accent/50 hover:bg-surface-3/50'}
          ${loading ? 'pointer-events-none' : ''}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl animate-pulse">⚙️</div>
            <p className="text-white/80 font-medium">Processando PDF...</p>
            <div className="w-full max-w-xs bg-surface-3 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="text-sm text-muted">{progresso}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">{dragging ? '📥' : '📄'}</div>
            <div>
              <p className="text-white font-semibold">
                {dragging ? 'Solte o PDF aqui' : 'Arraste o PDF ou clique para selecionar'}
              </p>
              <p className="text-sm text-muted mt-1">
                Relatório de turmas exportado do SIGAA/UFBA
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-accent/20 border border-accent/40 text-accent text-sm font-medium hover:bg-accent/30 transition-colors">
              Selecionar arquivo
            </div>
          </div>
        )}
      </div>

      {fileName && !loading && !erro && (
        <p className="text-sm text-success mt-2 text-center">
          ✓ {fileName} processado com sucesso
        </p>
      )}

      {erro && (
        <div className="mt-3 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-sm text-red-400">
          ❌ {erro}
        </div>
      )}

      <div className="mt-4 p-3 bg-surface-3 rounded-xl text-xs text-muted">
        <p className="font-medium text-white/60 mb-1">Como exportar o PDF do SIGAA:</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Acesse SIGAA → Ensino → Turmas → Relatório de Turmas</li>
          <li>Selecione o curso de Direito e o semestre desejado</li>
          <li>Clique em "Gerar Relatório" e salve o PDF</li>
        </ol>
      </div>
    </div>
  );
}

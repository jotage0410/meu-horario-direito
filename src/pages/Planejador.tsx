import { useState, useEffect, useCallback, useRef } from 'react';
import { AvisoMobile } from '../components/AvisoMobile';
import { CONFIG } from '../config';
import type { TurmaData, GradeSemanal } from '../types/schedule';
import { corParaCodigo } from '../utils/colors';
import { enriquecerTurmas } from '../utils/sigaaParser';
import { GradeHoraria } from '../components/GradeHoraria';
import { ListaDisciplinas } from '../components/ListaDisciplinas';
import { FonteSelector } from '../components/FonteSelector';
import { ModalCompartilhar } from '../components/ModalCompartilhar';
import { SEMESTRES_DIREITO } from '../data/semestres';
import { TURMAS_2026_1 } from '../data/turmas2026_1';

const STORAGE_KEY = 'mhd-grade-2026-1';

const TURMAS_INICIAIS = enriquecerTurmas(TURMAS_2026_1, SEMESTRES_DIREITO);

function parsearHashGrade(turmasDisponiveis: TurmaData[]): TurmaData[] | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#grade=')) return null;
  const raw = hash.slice(7);
  if (!raw) return null;
  const pares = raw.split(',');
  const resultado: TurmaData[] = [];
  for (const par of pares) {
    const [codigo, turma] = par.split('~');
    if (!codigo || !turma) continue;
    const turmaData = turmasDisponiveis.find(t => t.codigo === codigo && t.turma === turma);
    if (turmaData) resultado.push(turmaData);
  }
  return resultado.length > 0 ? resultado : null;
}

function carregarGrade(): TurmaData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function salvarGrade(turmas: TurmaData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(turmas));
}

type AbasMobile = 'lista' | 'grade';

export function Planejador() {
  const [turmas, setTurmas] = useState<TurmaData[]>(TURMAS_INICIAIS);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<TurmaData[]>(() => {
    const hashGrade = parsearHashGrade(TURMAS_INICIAIS);
    if (hashGrade) return hashGrade;
    return carregarGrade();
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [abaMobile, setAbaMobile] = useState<AbasMobile>('lista');
  const gradeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    salvarGrade(turmasSelecionadas);
  }, [turmasSelecionadas]);

  const handleNovasTurmas = useCallback((novas: TurmaData[]) => {
    setTurmas(enriquecerTurmas(novas, SEMESTRES_DIREITO));
    setTurmasSelecionadas([]);
  }, []);

  const handleAdicionar = useCallback((turma: TurmaData) => {
    setTurmasSelecionadas(prev => {
      if (prev.some(t => t.codigo === turma.codigo && t.turma === turma.turma)) return prev;
      return [...prev, turma];
    });
  }, []);

  const handleRemover = useCallback((codigo: string, turmaNum: string) => {
    setTurmasSelecionadas(prev =>
      prev.filter(t => !(t.codigo === codigo && t.turma === turmaNum))
    );
  }, []);

  const handleLimpar = useCallback(() => {
    setTurmasSelecionadas([]);
  }, []);

  // Ao adicionar uma disciplina no mobile, muda automaticamente para a aba da grade
  const handleAdicionarMobile = useCallback((turma: TurmaData) => {
    handleAdicionar(turma);
    // pequeno delay para o usuário ver o feedback antes de mudar de aba
    setTimeout(() => setAbaMobile('grade'), 300);
  }, [handleAdicionar]);

  const grade: GradeSemanal = {};
  for (const t of turmasSelecionadas) {
    const cor = corParaCodigo(t.codigo);
    for (const h of t.horarios) {
      const key = `${h.dia}-${h.bloco}`;
      grade[key] = { turmaCodigo: t.codigo, turmaNum: t.turma, cor };
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AvisoMobile />
      <div className="w-full max-w-[1600px] mx-auto flex flex-col flex-1 min-h-0">

        {/* Header */}
        <header className="flex-shrink-0 border-b border-border bg-surface-1/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="w-full px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm flex-shrink-0">M</div>
              <div>
                <h1 className="text-white font-black text-sm sm:text-base leading-none tracking-tight">Meu Horário Direito</h1>
                <p className="text-muted text-[10px] mt-0.5 hidden sm:block">FADIR · UFBA · 2026.1</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {turmasSelecionadas.length > 0 && (
                <>
                  <button
                    onClick={() => setModalAberto(true)}
                    className="flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
                  >
                    <span>🔗</span>
                    <span className="hidden sm:inline">Compartilhar</span>
                  </button>
                  <button
                    onClick={handleLimpar}
                    className="text-xs text-muted hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-950/30 hidden sm:block"
                  >
                    Limpar
                  </button>
                </>
              )}
              <span className="text-[11px] text-muted bg-surface-3 px-2 sm:px-2.5 py-1 rounded-full border border-border whitespace-nowrap">
                {turmasSelecionadas.length} <span className="hidden sm:inline">disciplina{turmasSelecionadas.length !== 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Fonte selector */}
        <div className="flex-shrink-0 border-b border-border bg-surface-1 px-4 sm:px-5 py-2">
          <FonteSelector
            onTurmasUpload={handleNovasTurmas}
            totalTurmasAtuais={turmas.length}
          />
        </div>

        {/* ── DESKTOP: layout lado a lado ── */}
        <div className="hidden md:flex flex-1 overflow-hidden min-h-0">
          <aside className="w-[340px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-1">
            <div className="flex-1 overflow-hidden p-3 flex flex-col min-h-0">
              <ListaDisciplinas
                turmas={turmas}
                turmasSelecionadas={turmasSelecionadas}
                onAdicionar={handleAdicionar}
                onRemover={handleRemover}
              />
            </div>
          </aside>
          <main className="flex-1 overflow-auto p-4 min-w-0">
            <GradeHoraria
              ref={gradeRef}
              turmasSelecionadas={turmasSelecionadas}
              grade={grade}
              onRemover={handleRemover}
            />
          </main>
        </div>

        {/* ── MOBILE: abas alternáveis ── */}
        <div className="flex md:hidden flex-col flex-1 min-h-0 overflow-hidden">
          {/* Barra de abas mobile */}
          <div className="flex-shrink-0 flex border-b border-border bg-surface-1">
            <button
              onClick={() => setAbaMobile('lista')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
                abaMobile === 'lista'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-white'
              }`}
            >
              <span>📚</span>
              <span>Disciplinas</span>
            </button>
            <button
              onClick={() => setAbaMobile('grade')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
                abaMobile === 'grade'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-white'
              }`}
            >
              <span>📅</span>
              <span>Minha Grade</span>
              {turmasSelecionadas.length > 0 && (
                <span className="ml-1 bg-accent text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none">
                  {turmasSelecionadas.length}
                </span>
              )}
            </button>
          </div>

          {/* Conteúdo da aba ativa */}
          <div className="flex-1 overflow-hidden min-h-0">
            {abaMobile === 'lista' && (
              <div className="h-full p-3 flex flex-col min-h-0 overflow-hidden">
                <ListaDisciplinas
                  turmas={turmas}
                  turmasSelecionadas={turmasSelecionadas}
                  onAdicionar={handleAdicionarMobile}
                  onRemover={handleRemover}
                />
              </div>
            )}
            {abaMobile === 'grade' && (
              <div className="h-full overflow-auto p-3">
                {turmasSelecionadas.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                    <div className="text-4xl">📅</div>
                    <p className="text-sm font-semibold text-white/60">Sua grade está vazia</p>
                    <p className="text-xs text-muted">Vá em "Disciplinas" e adicione matérias à sua grade.</p>
                    <button
                      onClick={() => setAbaMobile('lista')}
                      className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
                    >
                      Ir para Disciplinas →
                    </button>
                  </div>
                )}
                {turmasSelecionadas.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted">{turmasSelecionadas.length} disciplina{turmasSelecionadas.length !== 1 ? 's' : ''} selecionada{turmasSelecionadas.length !== 1 ? 's' : ''}</p>
                      <button
                        onClick={handleLimpar}
                        className="text-xs text-muted hover:text-red-400 transition-colors"
                      >
                        Limpar tudo
                      </button>
                    </div>
                    <GradeHoraria
                      ref={gradeRef}
                      turmasSelecionadas={turmasSelecionadas}
                      grade={grade}
                      onRemover={handleRemover}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-border bg-surface-1 py-3 px-5 text-center">
          <p className="text-white font-black text-lg tracking-tight">VTNC* SIGAA</p>
          <p className="text-muted text-[10px] mt-0.5">*vim trabalhar no cruzeiro sigaa</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a
              href={CONFIG.LINK_SUGESTOES}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-success transition-colors"
            >
              <span>💬</span>
              <span>Sugestões</span>
            </a>
            <span className="text-border">·</span>
            <a
              href="https://github.com/jotage0410/meu-horario-direito"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-white transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>Repositório</span>
            </a>
          </div>
        </footer>

      </div>

      {modalAberto && (
        <ModalCompartilhar
          turmasSelecionadas={turmasSelecionadas}
          gradeRef={gradeRef}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}

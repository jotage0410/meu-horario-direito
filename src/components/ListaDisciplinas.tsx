import { useState, useMemo, useRef, useEffect } from 'react';
import type { TurmaData } from '../types/schedule';
import { formatarHorarios } from '../utils/sigaaParser';
import { corParaCodigo } from '../utils/colors';

interface ListaDisciplinasProps {
  turmas: TurmaData[];
  turmasSelecionadas: TurmaData[];
  onAdicionar: (turma: TurmaData) => void;
  onRemover: (codigo: string, turmaNum: string) => void;
}

const TURNOS = [
  { id: 'M', label: 'Manhã' },
  { id: 'T', label: 'Tarde' },
  { id: 'N', label: 'Noite' },
];

const DIAS_FILTRO = [
  { id: '2', label: 'Seg' },
  { id: '3', label: 'Ter' },
  { id: '4', label: 'Qua' },
  { id: '5', label: 'Qui' },
  { id: '6', label: 'Sex' },
  { id: '7', label: 'Sáb' },
];

const DIA_NOME: Record<string, string> = {
  '2': 'Segunda', '3': 'Terça', '4': 'Quarta',
  '5': 'Quinta',  '6': 'Sexta', '7': 'Sábado',
};

export function ListaDisciplinas({ turmas, turmasSelecionadas, onAdicionar, onRemover }: ListaDisciplinasProps) {
  const [busca, setBusca] = useState('');
  const [semestresFiltro, setSemestresFiltro] = useState<number[]>([]);
  const [turnosFiltro, setTurnosFiltro] = useState<string[]>([]);
  const [diasFiltro, setDiasFiltro] = useState<string[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const itemExpandidoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandido && itemExpandidoRef.current && listaRef.current) {
      const lista = listaRef.current;
      const item = itemExpandidoRef.current;
      const listaRect = lista.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      if (itemRect.bottom > listaRect.bottom) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [expandido]);

  const semestresDisponiveis = useMemo(() => {
    const set = new Set<number>();
    for (const t of turmas) {
      if (t.semestre) set.add(t.semestre);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [turmas]);

  const codigosComTurmaSelecionada = useMemo(
    () => new Set(turmasSelecionadas.map(t => t.codigo)),
    [turmasSelecionadas]
  );

  const selecionadasIds = useMemo(
    () => new Set(turmasSelecionadas.map(t => `${t.codigo}-${t.turma}`)),
    [turmasSelecionadas]
  );

  const toggleSemestre = (s: number) =>
    setSemestresFiltro(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleTurno = (t: string) =>
    setTurnosFiltro(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleDia = (d: string) =>
    setDiasFiltro(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const temFiltroAtivo = semestresFiltro.length > 0 || turnosFiltro.length > 0 || diasFiltro.length > 0;
  const totalFiltrosAtivos = semestresFiltro.length + turnosFiltro.length + diasFiltro.length;

  const disciplinasFiltradas = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return turmas.filter(t => {
      if (q && !t.nome.toLowerCase().includes(q) && !t.codigo.toLowerCase().includes(q) && !t.docente.toLowerCase().includes(q)) return false;
      if (semestresFiltro.length > 0 && !semestresFiltro.includes(t.semestre ?? -1)) return false;
      if (turnosFiltro.length > 0) {
        const turnos = new Set(t.horarios.map(h => h.bloco[0]));
        if (!turnosFiltro.some(tf => turnos.has(tf))) return false;
      }
      if (diasFiltro.length > 0) {
        const diasNomes = new Set(t.horarios.map(h => h.dia));
        if (!diasFiltro.map(d => DIA_NOME[d]).some(d => diasNomes.has(d))) return false;
      }
      return true;
    });
  }, [turmas, busca, semestresFiltro, turnosFiltro, diasFiltro]);

  const disciplinasAgrupadas = useMemo(() => {
    const grupos: Record<string, TurmaData[]> = {};
    for (const t of disciplinasFiltradas) {
      if (!grupos[t.codigo]) grupos[t.codigo] = [];
      grupos[t.codigo].push(t);
    }
    return Object.entries(grupos).sort(([, a], [, b]) => {
      const semA = a[0].semestre ?? 999;
      const semB = b[0].semestre ?? 999;
      if (semA !== semB) return semA - semB;
      return a[0].nome.localeCompare(b[0].nome);
    });
  }, [disciplinasFiltradas]);

  // Só exibe lista se há busca ou filtro ativo
  const deveExibirLista = busca.trim().length > 0 || temFiltroAtivo;

  const limparTudo = () => {
    setSemestresFiltro([]);
    setTurnosFiltro([]);
    setDiasFiltro([]);
    setBusca('');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Busca */}
      <div className="relative mb-2 flex-shrink-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        <input
          type="text"
          placeholder="Buscar disciplina, código ou professor..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full bg-surface-3 border border-border rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white text-lg leading-none"
          >×</button>
        )}
      </div>

      {/* Filtros — botão + painel colapsável */}
      <div className="flex-shrink-0 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFiltrosAbertos(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
              temFiltroAtivo
                ? 'border-accent/60 text-accent bg-accent/10'
                : 'border-border text-muted hover:border-accent/40 hover:text-white'
            }`}
          >
            <span>⚙</span>
            <span>Filtros</span>
            {totalFiltrosAtivos > 0 && (
              <span className="bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalFiltrosAtivos}
              </span>
            )}
            <span className={`text-[10px] transition-transform duration-200 ${filtrosAbertos ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {/* Tags de filtros ativos */}
          {semestresFiltro.map(s => (
            <button key={s} onClick={() => toggleSemestre(s)}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 border border-accent/40 text-accent hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400 transition-colors">
              {s}º <span className="ml-0.5 opacity-70">×</span>
            </button>
          ))}
          {turnosFiltro.map(t => (
            <button key={t} onClick={() => toggleTurno(t)}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 border border-warning/40 text-warning hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400 transition-colors">
              {TURNOS.find(x => x.id === t)?.label} <span className="ml-0.5 opacity-70">×</span>
            </button>
          ))}
          {diasFiltro.map(d => (
            <button key={d} onClick={() => toggleDia(d)}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-4 border border-border text-muted hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400 transition-colors">
              {DIAS_FILTRO.find(x => x.id === d)?.label} <span className="ml-0.5 opacity-70">×</span>
            </button>
          ))}
          {temFiltroAtivo && (
            <button onClick={limparTudo}
              className="text-[10px] text-muted hover:text-red-400 transition-colors whitespace-nowrap">
              limpar tudo
            </button>
          )}
        </div>

        {/* Painel expansível de filtros */}
        {filtrosAbertos && (
          <div className="mt-2 p-3 bg-surface-3 rounded-xl border border-border/60 space-y-3 animate-slide-up">
            {/* Semestres */}
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Semestre</p>
              <div className="flex flex-wrap gap-1.5">
                {semestresDisponiveis.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSemestre(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                      semestresFiltro.includes(s)
                        ? 'bg-accent border-accent text-white'
                        : 'bg-surface-4 border-border text-muted hover:border-accent/60 hover:text-white'
                    }`}
                  >
                    {s}º
                  </button>
                ))}
              </div>
            </div>

            {/* Turno */}
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Turno</p>
              <div className="flex gap-1.5">
                {TURNOS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleTurno(id)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                      turnosFiltro.includes(id)
                        ? 'bg-warning/20 border-warning/60 text-warning'
                        : 'bg-surface-4 border-border text-muted hover:border-warning/40 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dias */}
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Dia da semana</p>
              <div className="flex gap-1">
                {DIAS_FILTRO.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleDia(id)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                      diasFiltro.includes(id)
                        ? 'bg-surface-4 border-accent/80 text-accent'
                        : 'bg-surface-4 border-border text-muted hover:border-accent/40 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estado inicial — pede para usar busca ou filtro */}
      {!deveExibirLista && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-border flex items-center justify-center text-2xl">
            📚
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60 mb-1">Busque uma disciplina</p>
            <p className="text-xs text-muted leading-relaxed">
              Use a busca ou selecione um<br/>semestre para ver as matérias.
            </p>
          </div>
          {/* Atalhos rápidos de semestre */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {semestresDisponiveis.map(s => (
              <button
                key={s}
                onClick={() => { setSemestresFiltro([s]); setFiltrosAbertos(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-3 border border-border text-muted hover:border-accent/60 hover:text-accent transition-colors"
              >
                {s}º Sem.
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista filtrada */}
      {deveExibirLista && (
        <>
          <p className="text-[11px] text-muted mb-2 flex-shrink-0">
            {disciplinasAgrupadas.length} disciplina{disciplinasAgrupadas.length !== 1 ? 's' : ''}
            <span className="opacity-60"> · {disciplinasFiltradas.length} turmas</span>
          </p>

          <div ref={listaRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 custom-scroll">
            {disciplinasAgrupadas.length === 0 && (
              <p className="text-muted text-center py-8 text-sm">Nenhuma disciplina encontrada.</p>
            )}

            {disciplinasAgrupadas.map(([codigo, turmasList]) => {
              const primeiraT = turmasList[0];
              const cor = corParaCodigo(codigo);
              const isExpanded = expandido === codigo;
              const turmaSelecionadaDesta = turmasSelecionadas.find(t => t.codigo === codigo);

              return (
                <div
                  key={codigo}
                  ref={isExpanded ? itemExpandidoRef : undefined}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandido(isExpanded ? null : codigo)}
                    className="w-full flex items-start gap-3 p-3 text-left hover:bg-surface-3/40 transition-colors"
                  >
                    <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ background: cor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="text-[10px] font-mono font-bold flex-shrink-0" style={{ color: cor }}>
                            {codigo}
                          </span>
                          {primeiraT.semestre && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-4 text-muted font-medium flex-shrink-0">
                              {primeiraT.semestre}º
                            </span>
                          )}
                          {turmaSelecionadaDesta && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                              style={{ background: cor + '25', color: cor, border: `1px solid ${cor}50` }}>
                              T{turmaSelecionadaDesta.turma} ✓
                            </span>
                          )}
                        </div>
                        <span className={`text-muted text-[11px] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                      <div className="text-sm font-semibold text-white/90 mt-0.5 leading-snug">{primeiraT.nome}</div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {turmasList.length} turma{turmasList.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50 divide-y divide-border/25">
                      {turmasList.map(t => {
                        const isSel = selecionadasIds.has(`${t.codigo}-${t.turma}`);
                        const bloqueada = !isSel && codigosComTurmaSelecionada.has(t.codigo);
                        const horarioTexto = t.horarios.length > 0
                          ? formatarHorarios(t.horarios)
                          : t.horarioRaw || 'A definir';

                        return (
                          <div
                            key={`${t.codigo}-${t.turma}`}
                            className={`flex items-start gap-3 px-3 py-2.5 transition-colors ${
                              isSel ? 'bg-accent/8' : bloqueada ? 'opacity-40' : 'hover:bg-surface-3/25'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] font-bold text-white/85">Turma {t.turma}</span>
                                {t.local && t.local !== 'DIR' && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-4 text-muted">{t.local}</span>
                                )}
                              </div>
                              <div className="text-[11px] text-white/55 truncate">👤 {t.docente}</div>
                              <div className="text-[11px] text-accent-light font-mono mt-0.5">🕐 {horarioTexto}</div>
                            </div>
                            <button
                              onClick={() => {
                                if (bloqueada) return;
                                isSel ? onRemover(t.codigo, t.turma) : onAdicionar(t);
                              }}
                              disabled={bloqueada}
                              title={
                                bloqueada
                                  ? `Já existe a turma ${turmaSelecionadaDesta?.turma} selecionada`
                                  : isSel ? 'Remover da grade' : 'Adicionar à grade'
                              }
                              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all active:scale-90 ${
                                bloqueada
                                  ? 'bg-surface-4 border border-border text-muted cursor-not-allowed'
                                  : isSel
                                  ? 'bg-red-900/40 border border-red-700/50 text-red-400 hover:bg-red-900/60'
                                  : 'bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30'
                              }`}
                            >
                              {isSel ? '−' : bloqueada ? '·' : '+'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

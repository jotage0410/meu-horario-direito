import React, { useMemo } from 'react';
import type { TurmaData, GradeSemanal } from '../types/schedule';
import { corParaCodigo, corFundo } from '../utils/colors';
import { formatarHorarios } from '../utils/sigaaParser';

// Grade sempre mostra todos os dias e horários
const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const HORARIOS_LABEL: Record<string, string> = {
  M1: '07:00', M2: '07:55', M3: '08:50', M4: '09:45', M5: '10:40', M6: '11:35',
  T1: '13:00', T2: '13:55', T3: '14:50', T4: '15:45', T5: '16:40', T6: '17:35',
  N1: '18:30', N2: '19:25', N3: '20:20', N4: '21:15',
};

const TURNO_HEADER: { label: string; blocos: string[]; cor: string }[] = [
  { label: 'Manhã', blocos: ['M1','M2','M3','M4','M5','M6'], cor: '#f59e0b' },
  { label: 'Tarde', blocos: ['T1','T2','T3','T4','T5','T6'], cor: '#3b82f6' },
  { label: 'Noite', blocos: ['N1','N2','N3','N4'],           cor: '#7c3aed' },
];

interface GradeHorariaProps {
  turmasSelecionadas: TurmaData[];
  grade: GradeSemanal;
  onRemover: (codigo: string, turma: string) => void;
}

export const GradeHoraria = React.forwardRef<HTMLDivElement, GradeHorariaProps>(
  function GradeHoraria({ turmasSelecionadas, grade, onRemover }, ref) {
    const turmaMap = useMemo(() => {
      const m: Record<string, TurmaData> = {};
      for (const t of turmasSelecionadas) {
        m[`${t.codigo}-${t.turma}`] = t;
      }
      return m;
    }, [turmasSelecionadas]);

    const conflitos = useMemo(() => {
      const conflicts = new Set<string>();
      const seen: Record<string, string> = {};
      for (const t of turmasSelecionadas) {
        for (const h of t.horarios) {
          const key = `${h.dia}-${h.bloco}`;
          if (seen[key] && seen[key] !== `${t.codigo}-${t.turma}`) {
            conflicts.add(key);
          } else {
            seen[key] = `${t.codigo}-${t.turma}`;
          }
        }
      }
      return conflicts;
    }, [turmasSelecionadas, grade]);

    return (
      <div ref={ref} className="w-full">
        {/* Mini cards das disciplinas selecionadas */}
        {turmasSelecionadas.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {turmasSelecionadas.map(t => {
              const cor = corParaCodigo(t.codigo);
              const horarioLegivel = formatarHorarios(t.horarios);
              return (
                <button
                  key={`${t.codigo}-${t.turma}`}
                  onClick={() => onRemover(t.codigo, t.turma)}
                  title={`Clique para remover ${t.nome}`}
                  className="group relative flex flex-col gap-1 px-3 py-2.5 rounded-xl text-left transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: corFundo(cor, 0.13),
                    border: `1px solid ${cor}44`,
                  }}
                >
                  {/* Barra colorida lateral */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{ background: cor }}
                  />
                  {/* Código + badge turma */}
                  <div className="flex items-center justify-between gap-1 pl-1">
                    <span className="text-[11px] font-black leading-none" style={{ color: cor }}>
                      {t.codigo}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: cor + '22', color: cor }}
                    >
                      T{t.turma}
                    </span>
                  </div>
                  {/* Nome da matéria */}
                  <div className="pl-1 text-[10px] font-semibold text-white/80 leading-tight line-clamp-1">
                    {t.nome}
                  </div>
                  {/* Horário */}
                  <div className="pl-1 text-[9px] text-white/45 leading-tight truncate">
                    🕐 {horarioLegivel}
                  </div>
                  {/* Professor */}
                  <div className="pl-1 text-[9px] text-white/40 leading-tight truncate">
                    👤 {t.docente !== 'A definir' ? t.docente.split(' ').slice(0, 2).join(' ') : 'A definir'}
                  </div>
                  {/* Ícone de remover */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white/40 hover:text-red-400">
                    ×
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Grade semanal — sempre expandida, todos os dias e horários */}
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="border-collapse w-full" style={{ minWidth: '720px' }}>
            <thead>
              <tr>
                <th className="bg-surface-2 border-r border-border px-2 py-3 text-muted font-medium text-[11px] text-center w-[68px]">
                  Horário
                </th>
                {DIAS.map(dia => (
                  <th
                    key={dia}
                    className="bg-surface-2 border-r last:border-r-0 border-border px-2 py-3 font-bold text-center text-white/85 text-sm"
                  >
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TURNO_HEADER.map(({ label, blocos, cor: turnoCor }) => (
                <React.Fragment key={label}>
                  {/* Faixa do turno */}
                  <tr>
                    <td
                      colSpan={DIAS.length + 1}
                      className="px-3 py-[3px] text-[10px] font-black uppercase tracking-widest border-t border-border/60"
                      style={{ background: turnoCor + '14', color: turnoCor }}
                    >
                      {label}
                    </td>
                  </tr>

                  {blocos.map(bloco => (
                    <tr key={bloco} className="border-t border-border/30 hover:bg-white/[0.01]">
                      {/* Coluna de horário */}
                      <td className="bg-surface-2 border-r border-border px-2 py-1.5 text-center w-[68px] whitespace-nowrap">
                        <div className="text-[11px] font-bold text-white/65">{bloco}</div>
                        <div className="text-[9px] text-muted/70">{HORARIOS_LABEL[bloco]}</div>
                      </td>

                      {/* Células dos dias */}
                      {DIAS.map(dia => {
                        const key = `${dia}-${bloco}`;
                        const item = grade[key];
                        const isConflito = conflitos.has(key);
                        const turma = item ? turmaMap[`${item.turmaCodigo}-${item.turmaNum}`] : null;
                        const cor = turma ? corParaCodigo(turma.codigo) : '';

                        return (
                          <td
                            key={dia}
                            className="border-r last:border-r-0 border-border/30 p-[3px] align-top"
                            style={{ height: '58px' }}
                          >
                            {turma ? (
                              <button
                                onClick={() => onRemover(turma.codigo, turma.turma)}
                                title={`${turma.codigo} · ${turma.nome} · T${turma.turma}\nClique para remover`}
                                className="w-full h-full min-h-[52px] rounded-md px-1.5 py-1 text-left transition-all hover:brightness-115 hover:scale-[1.025] active:scale-95 flex flex-col justify-between"
                                style={{
                                  background: corFundo(cor, 0.22),
                                  border: isConflito ? '2px solid #ef4444' : `1.5px solid ${cor}55`,
                                  boxShadow: isConflito ? `0 0 8px #ef444430` : `0 1px 6px ${cor}15`,
                                }}
                              >
                                {/* Código em destaque */}
                                <div className="text-[10px] font-black leading-none truncate" style={{ color: cor }}>
                                  {turma.codigo}
                                </div>
                                {/* Nome da matéria */}
                                <div className="text-[8.5px] leading-tight mt-0.5 line-clamp-2 text-white/60">
                                  {turma.nome}
                                </div>
                                {/* Turma + conflito */}
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[9px] font-semibold" style={{ color: cor + 'aa' }}>
                                    T{turma.turma}
                                  </span>
                                  {isConflito && (
                                    <span className="text-[8px] text-red-400 font-bold">⚠ CONFLITO</span>
                                  )}
                                </div>
                              </button>
                            ) : (
                              <div className="w-full min-h-[52px]" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Aviso de conflito */}
        {conflitos.size > 0 && (
          <div className="mt-3 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-sm text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Há <strong>{conflitos.size}</strong> conflito{conflitos.size > 1 ? 's' : ''} de horário.
              Clique na disciplina na grade para remover.
            </span>
          </div>
        )}

        {/* Dica quando vazia */}
        {turmasSelecionadas.length === 0 && (
          <p className="text-center text-muted text-xs mt-4 opacity-60">
            Selecione disciplinas na lista ao lado para preencher a grade ↖
          </p>
        )}
      </div>
    );
  }
);

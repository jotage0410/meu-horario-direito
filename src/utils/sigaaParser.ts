import type { Horario, TurmaData } from '../types/schedule';

// ──────────────────────────────────────────────
// Mapeamento de dias SIGAA
// ──────────────────────────────────────────────
const DIAS: Record<string, string> = {
  '2': 'Segunda',
  '3': 'Terça',
  '4': 'Quarta',
  '5': 'Quinta',
  '6': 'Sexta',
  '7': 'Sábado',
};

// ──────────────────────────────────────────────
// Mapeamento de blocos → horários
// ──────────────────────────────────────────────
const HORARIOS: Record<string, { inicio: string; fim: string }> = {
  M1: { inicio: '07:00', fim: '07:55' },
  M2: { inicio: '07:55', fim: '08:50' },
  M3: { inicio: '08:50', fim: '09:45' },
  M4: { inicio: '09:45', fim: '10:40' },
  M5: { inicio: '10:40', fim: '11:35' },
  M6: { inicio: '11:35', fim: '12:30' },
  T1: { inicio: '13:00', fim: '13:55' },
  T2: { inicio: '13:55', fim: '14:50' },
  T3: { inicio: '14:50', fim: '15:45' },
  T4: { inicio: '15:45', fim: '16:40' },
  T5: { inicio: '16:40', fim: '17:35' },
  T6: { inicio: '17:35', fim: '18:30' },
  N1: { inicio: '18:30', fim: '19:25' },
  N2: { inicio: '19:25', fim: '20:20' },
  N3: { inicio: '20:20', fim: '21:15' },
  N4: { inicio: '21:15', fim: '22:10' },
};

/**
 * Decodifica uma string de horário SIGAA (ex: "24N12", "5M3456", "35T456")
 * e retorna um array de objetos Horario.
 */
export function parseHorario(horarioStr: string): Horario[] {
  const resultado: Horario[] = [];
  // Um código pode conter múltiplos segmentos separados por espaço, ex: "2N34 4N34"
  const segmentos = horarioStr.trim().split(/\s+/);

  for (const seg of segmentos) {
    // Formato: dias (dígitos) + turno (M|T|N) + blocos (dígitos)
    const match = seg.match(/^(\d+)([MTN])(\d+)$/i);
    if (!match) continue;

    const [, diasStr, turno, blocosStr] = match;
    const turnoUpper = turno.toUpperCase();

    for (const dChar of diasStr) {
      const diaNome = DIAS[dChar];
      if (!diaNome) continue;

      for (const bChar of blocosStr) {
        const blocoKey = `${turnoUpper}${bChar}`;
        const horario = HORARIOS[blocoKey];
        if (!horario) continue;

        resultado.push({
          dia: diaNome,
          bloco: blocoKey,
          inicio: horario.inicio,
          fim: horario.fim,
        });
      }
    }
  }

  return resultado;
}

/**
 * Formata um array de Horario de forma legível.
 * Ex: "Seg 08:50–10:40, Qua 08:50–10:40"
 */
export function formatarHorarios(horarios: Horario[]): string {
  if (!horarios.length) return 'A definir';

  // Agrupa por dia
  const porDia: Record<string, Horario[]> = {};
  for (const h of horarios) {
    if (!porDia[h.dia]) porDia[h.dia] = [];
    porDia[h.dia].push(h);
  }

  return Object.entries(porDia)
    .map(([dia, hs]) => {
      const sorted = hs.sort((a, b) => a.inicio.localeCompare(b.inicio));
      const abrev = dia.substring(0, 3);
      const inicio = sorted[0].inicio;
      const fim = sorted[sorted.length - 1].fim;
      return `${abrev} ${inicio}–${fim}`;
    })
    .join(', ');
}

// ──────────────────────────────────────────────
// Parsing do texto SIGAA (relatório de turmas)
// ──────────────────────────────────────────────

interface TurmaRaw {
  codigo: string;
  nome: string;
  turma: string;
  docente: string;
  horarioRaw: string;
  local: string;
  capacidade: number;
  periodo: string;
}

/**
 * Faz o parsing do texto extraído de um relatório de turmas do SIGAA.
 * Retorna um array de TurmaRaw (sem semestres — esses vêm do mapa externo).
 */
export function parseSigaaText(text: string): TurmaRaw[] {
  const turmas: TurmaRaw[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentCodigo = '';
  let currentNome = '';
  let currentPeriodo = '2026.1';

  // Padrão de linha de cabeçalho de componente:
  // "DIRA89 - CIÊNCIA DAS FINANÇAS E DIREITO FINANCEIRO"
  const headerRe = /^([A-Z]{3,}[A-Z0-9]*\d{0,4}(?:[A-Z0-9]*)?)\s*[-–]\s*(.+)$/;

  // Padrão de linha de turma:
  // Turma: 01  Professor: João Silva  Horário: 5M3456  Local: DIR  Cap: 45
  // ou variações extraídas pelo pdf.js (texto corrido)

  // Padrão de período
  const periodoRe = /(\d{4}\.\d)/;

  // Padrão horário SIGAA
  const horarioRe = /\b(\d+[MTN]\d+(?:\s+\d+[MTN]\d+)*)\b/i;

  // Padrão capacidade: "0/45 alunos" ou "45 alunos" ou "Cap.: 45"
  const capRe = /(\d+)\s*\/\s*(\d+)\s*alunos?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detecta período
    const pm = line.match(periodoRe);
    if (pm && !line.includes('Horário')) {
      currentPeriodo = pm[1];
    }

    // Detecta cabeçalho de componente
    const hm = line.match(headerRe);
    if (hm) {
      // Verifica se parece um código de disciplina (começa com letras)
      const possibleCod = hm[1];
      if (possibleCod.length >= 4 && possibleCod.length <= 12) {
        currentCodigo = possibleCod;
        currentNome = hm[2].trim();
        continue;
      }
    }

    // Detecta linha de turma (contém horário SIGAA e número de turma)
    const horMatch = line.match(horarioRe);
    if (horMatch && currentCodigo) {
      const horarioRaw = horMatch[1].trim();

      // Tenta extrair número da turma: "Turma: 01" ou "T01" ou dígitos isolados
      const turmaMatch = line.match(/[Tt]urma[:\s]+(\w+)/) ||
                          line.match(/\bT(\d{2})\b/) ||
                          line.match(/^\s*(\d{2})\s/);
      const turmaNum = turmaMatch ? turmaMatch[1] : '01';

      // Capacidade
      const capMatch = line.match(capRe);
      const capacidade = capMatch ? parseInt(capMatch[2]) : 45;

      // Local (código de local como DIR, PAC, etc.)
      const localMatch = line.match(/\b(DIR|PAC|PASL|MED|EDC|ADM|ARQ|IHAC|FACED|ICS)\b/);
      const local = localMatch ? localMatch[1] : 'DIR';

      // Docente — pode estar na mesma linha ou na próxima
      let docente = '';
      const docenteMatch = line.match(/[Dd]ocente[s]?[:\s]+(.+?)(?:\s+\d{2}h|\s+Horário|$)/);
      if (docenteMatch) {
        docente = docenteMatch[1].trim();
      } else if (i + 1 < lines.length) {
        // Próxima linha pode ser o docente
        const next = lines[i + 1];
        if (!next.match(horarioRe) && !next.match(headerRe) && next.length > 3) {
          docente = next.replace(/\d+h/g, '').trim();
        }
      }

      turmas.push({
        codigo: currentCodigo,
        nome: currentNome,
        turma: turmaNum,
        docente: docente || 'A definir',
        horarioRaw,
        local,
        capacidade,
        periodo: currentPeriodo,
      });
    }
  }

  return turmas;
}

/**
 * Enriquece turmas raw com horários decodificados e semestres do mapa externo.
 */
export function enriquecerTurmas(
  raws: TurmaRaw[],
  semestresMap: Record<string, number>
): TurmaData[] {
  return raws.map(r => ({
    ...r,
    horarios: parseHorario(r.horarioRaw),
    semestre: semestresMap[r.codigo],
  }));
}

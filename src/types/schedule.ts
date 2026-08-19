export interface Horario {
  dia: string;            // "Segunda", "Terça", etc.
  bloco: string;          // "M1", "T3", "N2", etc.
  inicio: string;         // "08:50"
  fim: string;            // "09:45"
}

export interface TurmaData {
  codigo: string;         // "DIRA89"
  nome: string;           // "DIREITO CONSTITUCIONAL"
  turma: string;          // "01"
  docente: string;        // "Nome do Professor"
  horarioRaw: string;     // "24N12" (código SIGAA)
  horarios: Horario[];    // decodificado
  local: string;          // "DIR"
  capacidade: number;     // 45
  periodo: string;        // "2026.1"
  semestre?: number;      // 1–10, do mapa de semestres
}

export type GradeItem = {
  turmaCodigo: string;    // "DIRA89"
  turmaNum: string;       // "01"
  cor: string;            // cor CSS gerada via hash
};

export type GradeSemanal = {
  // chave: "Segunda-M3", "Terça-N1", etc.
  [diaBloco: string]: GradeItem;
};

export interface Conflito {
  diaBloco: string;
  turmas: string[]; // lista de "CODIGO-01"
}

// ──────────────────────────────────────────────
// Estrutura curricular (matriz de disciplinas + pré-requisitos)
// ──────────────────────────────────────────────
export interface DisciplinaCurricular {
  codigo: string;                       // "DIR043"
  nome: string;                         // "Direito do Trabalho I"
  ch: number;                           // carga horária (horas)
  tipo: 'Obrigatória' | 'Optativa';
  semestre: number | null;             // 1–10 (obrigatórias) ou null (optativas)
  prereqRaw: string;                    // expressão original "( DIRA45 E FCH007 ) OU ( IPSB68 )"
  prereqCodigos: string[];             // ["DIRA45", "FCH007", "IPSB68"]
  liberaCodigos: string[];             // matérias que esta destrava
}

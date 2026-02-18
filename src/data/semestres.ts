// Mapa de código da disciplina → nível (semestre) da grade curricular
// Fonte: Matriz Curricular oficial DIREITO/FADIR - UFBA (nova grade)

export const SEMESTRES_DIREITO: Record<string, number> = {
  // ── 1º NÍVEL ─────────────────────────────────────────────
  'DIR213':   1,  // Ciência Política
  'DIRA45':   1,  // Teoria do Direito I
  'DIRA75':   1,  // Metodologia da Pesquisa em Direito
  'ECOB40':   1,  // Introdução à Economia I
  'FCH001':   1,  // Introdução à Filosofia I
  'FCH007':   1,  // Introdução à Sociologia II

  // ── 2º NÍVEL ─────────────────────────────────────────────
  'DIRA74':   2,  // História do Direito
  'DIRA79':   2,  // Teoria da Constituição e Organização do Estado
  'DIRA82':   2,  // Teoria Geral do Direito Civil I
  'DIRA83':   2,  // Teoria do Direito Penal I
  'FCH124':   2,  // Antropologia I
  'IPSA01':   2,  // Psicologia I

  // ── 3º NÍVEL ─────────────────────────────────────────────
  'DIR007':   3,  // Direitos Fundamentais
  'DIRA80':   3,  // Sociologia Jurídica
  'DIRA84':   3,  // Direito Constitucional
  'DIRA86':   3,  // Teoria Geral do Direito Civil II
  'DIRA88':   3,  // Teoria do Direito Penal II
  'DIRA89':   3,  // Ciência das Finanças e Direito Financeiro

  // ── 4º NÍVEL ─────────────────────────────────────────────
  'DIR030':   4,  // Teoria Geral do Processo
  'DIR031':   4,  // Direito Administrativo I
  'DIR192':   4,  // Direitos Reais I
  'DIR194':   4,  // Direito Penal III
  'DIRA85':   4,  // Filosofia do Direito
  'DIRA90':   4,  // Direito das Obrigações I

  // ── 5º NÍVEL ─────────────────────────────────────────────
  'DIR032':   5,  // Direito Administrativo II
  'DIR035':   5,  // Direito Tributário I
  'DIR038':   5,  // Direito Processual Civil I
  'DIR046':   5,  // Direito Internacional Público
  'DIR195':   5,  // Direito Penal IV
  'DIRA91':   5,  // Direito das Obrigações II

  // ── 6º NÍVEL ─────────────────────────────────────────────
  'DIR036':   6,  // Direito Tributário II
  'DIR039':   6,  // Direito Processual Civil II-A
  'DIR043':   6,  // Direito do Trabalho I
  'DIR049':   6,  // Direito Processual Penal I-A
  'DIR190':   6,  // Hermenêutica Jurídica
  'DIRA92':   6,  // Contratos

  // ── 7º NÍVEL ─────────────────────────────────────────────
  'DIR015':   7,  // Direito de Família
  'DIR040':   7,  // Direito Processual Civil III-A
  'DIR044':   7,  // Direito Processual do Trabalho I
  'DIR050':   7,  // Direito Processual Penal II-A
  'DIRA95':   7,  // Direito Empresarial
  'GDIR0006': 7,  // Prática Jurídica Cível I

  // ── 8º NÍVEL ─────────────────────────────────────────────
  'DIR016':   8,  // Direito das Sucessões
  'DIR041':   8,  // Direito Processual Civil IV
  'DIR045':   8,  // Direito Coletivo do Trabalho e Sindical
  'DIRA76':   8,  // Direito Societário
  'DIRA96':   8,  // Trabalho de Conclusão de Curso I
  'GDIR0007': 8,  // Prática Jurídica Cível II

  // ── 9º NÍVEL ─────────────────────────────────────────────
  'DIR034':   9,  // Direito Ambiental
  'DIR189':   9,  // Ética Geral e Profissional
  'DIRA97':   9,  // Trabalho de Conclusão de Curso II
  'GDIR0005': 9,  // Direito e Relações Raciais
  'GDIR0008': 9,  // Prática Jurídica Trabalhista

  // ── 10º NÍVEL ────────────────────────────────────────────
  'DIR061':   10, // Direito das Relações de Consumo
  'GDIR0009': 10, // Prática Jurídica Penal
};

export const SEMESTRES_LABELS: Record<number, string> = {
  1:  '1º Nível',
  2:  '2º Nível',
  3:  '3º Nível',
  4:  '4º Nível',
  5:  '5º Nível',
  6:  '6º Nível',
  7:  '7º Nível',
  8:  '8º Nível',
  9:  '9º Nível',
  10: '10º Nível',
};

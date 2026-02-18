# Meu Horário Direito 📅

Site para montagem de grade horária do curso de **Direito da UFBA (FADIR)**, com dados do SIGAA 2026.1.

🔗 **Acesse:** [roxgrupos.cloud/horarios](https://roxgrupos.cloud/horarios/)

---

## Funcionalidades

- 📚 **Lista de disciplinas** com busca e filtros por semestre, turno e dia da semana
- 📅 **Grade semanal visual** com detecção automática de conflitos de horário
- 🔗 **Compartilhar grade** via URL única ou download de imagem PNG 1920×1080
- 📤 **Upload de PDF do SIGAA** para atualizar turmas manualmente
- 💾 Grade salva automaticamente no navegador (LocalStorage)
- 📱 Layout responsivo com abas para mobile

---

## Stack

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Frontend |
| Vite | Build tool |
| Tailwind CSS | Estilização (dark mode) |
| pdfjs-dist | Parsing de PDF no browser |
| Canvas API | Geração de imagem da grade |

---

## Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus dados

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

> **Windows:** se o Node.js não estiver no PATH, use os scripts `.ps1`:
> ```powershell
> powershell -ExecutionPolicy Bypass -File instalar.ps1
> powershell -ExecutionPolicy Bypass -File iniciar.ps1
> ```

---

## Estrutura do projeto

```
src/
├── components/
│   ├── GradeHoraria.tsx       # Grade semanal visual
│   ├── ListaDisciplinas.tsx   # Lista com filtros
│   ├── FonteSelector.tsx      # Upload de PDF / semestre atual
│   ├── ModalCompartilhar.tsx  # Modal com link + imagem
│   └── AvisoMobile.tsx        # Toast de aviso no mobile
├── data/
│   ├── turmas2026_1.ts        # 220+ turmas embutidas do SIGAA
│   └── semestres.ts           # Mapa código → semestre (1–10)
├── pages/
│   └── Planejador.tsx         # Página principal
├── utils/
│   ├── sigaaParser.ts         # Decodifica horários SIGAA
│   ├── pdfParser.ts           # Extrai texto de PDF
│   └── colors.ts              # Paleta de cores por disciplina
├── types/
│   └── schedule.ts            # Tipos TypeScript
└── config.ts                  # Configurações do site
```

---

## Formato de horários SIGAA

```
[dias][turno][blocos]  →  ex: 24N12 = Segunda+Quarta, Noite, blocos 1 e 2
```

| Código | Dia |
|---|---|
| 2 | Segunda |
| 3 | Terça |
| 4 | Quarta |
| 5 | Quinta |
| 6 | Sexta |
| 7 | Sábado |

| Turno | Horário |
|---|---|
| M (Manhã) | 07:00 – 12:30 |
| T (Tarde) | 13:00 – 18:30 |
| N (Noite) | 18:30 – 22:10 |

---

## Configuração

Copie `.env.example` para `.env.local` e preencha:

```env
# Link do botão "Sugestões" no rodapé
VITE_LINK_SUGESTOES=https://wa.me/SEU_NUMERO
```

---

## Licença

MIT — feito com ☕ por um estudante de Direito da UFBA.

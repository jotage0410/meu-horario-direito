# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeuHorarioDireito** is a schedule builder for UFBA Law School (FADIR) students. It lets students browse all courses offered in the current semester, add them to a weekly grid, detect time conflicts, and share/export their schedule. Course data is pulled from SIGAA (UFBA's academic system).

**Status:** Live at `roxgrupos.cloud/horarios`. Current semester: 2026.1.

## Tech Stack

- React 18.3, TypeScript 5.7, Vite 6
- Tailwind CSS 3.4, PostCSS, Autoprefixer
- html2canvas (PNG export), pdfjs-dist 4.9 (PDF parsing)
- No backend — fully static SPA

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally
npm run lint      # ESLint on src/
```

## Architecture

```
src/
  App.tsx                    # Entry point — renders Planejador page
  config.ts                  # Site config: semester, faculty name, deploy URL, suggestions link
  pages/
    Planejador.tsx           # Main page — state management, URL hash sharing, localStorage persistence
  components/
    GradeHoraria.tsx         # Weekly schedule grid (visual timetable)
    ListaDisciplinas.tsx     # Course list with search/filter + add/remove to schedule
    FonteSelector.tsx        # Source selector (semester picker)
    ModalCompartilhar.tsx    # Share modal — URL hash link + PNG export
    AvisoMobile.tsx          # Mobile warning notice
    UploadPDF.tsx            # PDF upload + parsing from SIGAA reports
  data/
    turmas2026_1.ts          # ~220 courses for 2026.1 (raw SIGAA data)
    semestres.ts             # Semester-to-course mapping (1st through 10th semester)
  types/
    schedule.ts              # TurmaData, Horario, GradeItem, GradeSemanal, Conflito
  utils/
    sigaaParser.ts           # Parses SIGAA time codes (e.g. "24N12" -> day/block/time)
    pdfParser.ts             # Extracts course data from SIGAA PDF reports
    colors.ts                # Generates consistent colors per course code
```

### Data Flow

1. Raw course data in `turmas2026_1.ts` (typed as `TurmaRaw[]`) is enriched via `sigaaParser.ts` to produce `TurmaData[]` with decoded time slots
2. User browses courses in `ListaDisciplinas`, adds them to their schedule
3. `GradeHoraria` renders a weekly grid; conflicts are detected when two courses overlap
4. Schedule persists to `localStorage` (key: `mhd-grade-2026-1`)
5. Sharing: schedule is encoded as URL hash (`#grade=CODE~TURMA,CODE~TURMA,...`), which is parsed on load
6. Export: html2canvas captures the grid as PNG for download

### SIGAA Time Code Format

Format: `<days><period><slots>` — e.g., `24N12` means days 2 (Monday) and 4 (Wednesday), Night period, slots 1-2.
- Days: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
- Periods: M=Morning, T=Afternoon, N=Night
- Slots: 1-6 within each period

## Key Design Decisions

- **No backend** — all data is static TypeScript arrays; no API calls, no database. This keeps hosting trivial and the app instant
- **SIGAA raw codes preserved** — the `horarioRaw` field stores the original SIGAA time format; parsing happens at runtime via `sigaaParser.ts`
- **URL hash for sharing** — encodes selected courses as `#grade=CODE~TURMA,...` so students can share links without any server
- **localStorage for persistence** — schedule survives page reloads; keyed by semester to avoid conflicts
- **Semester data is manually updated** — each new semester requires updating `turmas2026_1.ts` with fresh data from SIGAA. The PDF upload feature (`UploadPDF.tsx`) can help extract this data
- **Color assignment by course code** — deterministic hash-based coloring ensures the same course always gets the same color
- **Mobile warning** — the schedule grid is designed for desktop; mobile users see a notice

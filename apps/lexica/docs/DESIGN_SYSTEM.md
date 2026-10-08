# Lexica Design System — "Focus"

Dark, minimal, high-contrast. One accent color, big type, monospace for data.
Source of truth for tokens: `app/globals.css` (`@theme`). Visual reference:
the "Lexica – Swipe Screen Directions" canvas, direction C.

## Principles

1. **One accent.** Lime is the only brand color. It means *primary action* and *correct / known*. Never use it for decoration.
2. **Content first.** The word and the sentence are the largest things on screen. Chrome (counters, labels) is small, monospace and grey.
3. **Flat.** No gradients, no glows, no neon. Depth comes from the surface scale, not shadows.
4. **Quiet motion.** Motion confirms an action (swipe, reveal). No looping shimmer or pulse for decoration.
5. **No emoji in UI.** Use Lucide icons (stroke, 16–20 px).

## Color tokens

Use the semantic class (`bg-surface`, `text-muted`, `border-line`…), never a raw Tailwind palette color (`slate-*`, `cyan-*`…).

### Surfaces (darkest → lightest)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0E0F11` | Page background |
| `surface` | `#16171A` | Cards, sheets, modals |
| `surface-2` | `#1E2024` | Inputs, secondary buttons, nested blocks |
| `surface-3` | `#26282D` | Hover/pressed of `surface-2`, empty progress segments |

### Lines

| Token | Hex | Use |
|---|---|---|
| `line` | `#26282D` | Default 1 px borders, dividers |
| `line-strong` | `#34373D` | Borders on `surface-2`, focus-adjacent emphasis |

### Text

| Token | Hex | Contrast on `bg` | Use |
|---|---|---|---|
| `ink` | `#EDEEF0` | 16.5:1 | Headings, words, primary text |
| `ink-2` | `#C4C6CB` | 11.2:1 | Body copy, sentences |
| `muted` | `#9A9DA3` | 7.1:1 | Secondary text, labels |
| `subtle` | `#6B6E75` | 3.8:1 | Meta only (ELO, counters, separators). Not for sentences |

### Accent & status

| Token | Hex | Use |
|---|---|---|
| `accent` | `#C6F432` | Primary buttons, progress, "known", highlights, active nav |
| `accent-strong` | `#DBFF6E` | Hover/pressed of `accent` |
| `on-accent` | `#0E0F11` | Text/icons on `accent` (white on lime fails contrast) |
| `danger` | `#FF6B5B` | Errors, destructive actions, "wrong" |
| `warning` | `#F5B83D` | Review due, low energy, mastered/gold |
| `on-status` | `#0E0F11` | Text on solid `danger` / `warning` |

All accent/status colors pass WCAG AA on `bg` and `surface-2` (accent 15:1, danger 6.9:1, warning 10.8:1), and `on-accent` on `accent` is 15:1.

Tints are allowed with opacity: `bg-accent/10` for icon tiles and selected rows, `border-accent/40` for selected outlines. Keep tints ≤ 20%.

## Typography

| Role | Font | Size / weight | Class example |
|---|---|---|---|
| Display (the word) | Space Grotesk | 32–64 px, 700, tight tracking | `text-3xl font-bold tracking-tight` |
| Heading | Space Grotesk | 20–24 px, 700 | `text-xl font-bold` |
| Sentence / body | Space Grotesk | 16–20 px, 400, relaxed leading | `text-lg leading-relaxed text-ink-2` |
| UI text | Space Grotesk | 14 px, 500 | `text-sm font-medium` |
| Meta / labels / numbers | JetBrains Mono | 11–13 px, 400 | `font-mono text-xs text-muted` |

- Small uppercase labels are always mono: `font-mono text-[11px] uppercase text-subtle`.
- Numbers that change (counts, ELO, timers) are mono so they don't jitter.
- Both fonts load the `vietnamese` subset (`app/layout.tsx`); without it accented letters fall back to the system font.

## Shape & spacing

Tailwind's default radius scale:

| Element | Radius |
|---|---|
| Buttons, inputs, icon buttons | `rounded-xl` (12 px) |
| Cards, list rows | `rounded-2xl` (16 px) |
| Bottom sheets, large modals | `rounded-3xl` (24 px) |
| Progress segments, highlights | none |

Spacing follows the 4 px Tailwind scale. Screen padding 16–22 px; gap between stacked cards 8–12 px; card padding 20–24 px.

## Components

### Buttons

| Variant | Classes | Use |
|---|---|---|
| Primary | `h-14 rounded-xl bg-accent text-on-accent font-bold hover:bg-accent-strong` | One per screen: the main action |
| Secondary | `h-14 rounded-xl bg-surface border border-line text-ink font-medium hover:bg-surface-2` | Alternatives ("Chưa nhớ", "Để sau") |
| Ghost | `text-muted hover:text-ink` | Back links, tertiary |
| Destructive | `border border-danger/40 text-danger hover:bg-danger/10` | Reset, delete |
| Icon | `w-11 h-11 rounded-xl border border-line bg-surface-2` + `aria-label` | Speak, close |

Touch targets ≥ 44 px. Disabled: `disabled:opacity-40 disabled:cursor-not-allowed`.

### Progress

Segmented bar: one 3 px segment per unit (cap 30), `gap-[3px]`, filled `bg-accent`, empty `bg-surface-3`, label in mono above (`12/20 từ`). See `DailyProgress` in `app/page.tsx`. Continuous bars (energy) are 3–4 px, no glow.

### Vocabulary card (`VocabCard`)

1. Mono meta row: `ELO 1040`, review/boss tags, state icon.
2. Sentence (`text-lg text-ink-2`) with the target word highlighted: `bg-accent text-on-accent`, lowercase.
3. Bottom: reveal button → `WordBlock` (2 px accent left border, word 30 px bold, mono IPA, meaning in `ink`).
4. Below the card: Secondary "Chưa nhớ" + Primary "Đã nhớ" (same as swiping).

### Cards & rows

`rounded-2xl bg-surface border border-line p-5`. Selected: `border-accent/40 bg-accent/10`. Icon tile: `w-10 h-10 rounded-xl bg-accent/10 text-accent` (or `bg-surface-2 text-ink` when not accent-worthy).

### Inputs

`h-12 rounded-xl bg-surface-2 border border-line-strong text-ink placeholder-subtle focus:border-accent outline-none`.

### Modals & sheets

Backdrop `bg-black/60` (blur optional, ≤ `backdrop-blur-sm`). Panel `bg-surface border border-line rounded-3xl`. One primary action.

## Do / Don't

| Do | Don't |
|---|---|
| `bg-accent text-on-accent` | `bg-accent text-white` (fails contrast) |
| `text-muted` for secondary text | `text-subtle` for sentences |
| Lucide icon + label | Emoji in labels or toasts |
| Flat `bg-surface` | `bg-gradient-to-*`, colored `shadow-*` glows |
| `danger` only for errors/destructive | Red for decoration |

## Migrating legacy classes

The codebase was migrated from the old "cyber-arcade" palette with this mapping (re-run it on any stray class):

| Legacy | Token |
|---|---|
| `bg-slate-900/950` | `bg-bg` |
| `bg-slate-800` | `bg-surface` |
| `bg-slate-700` | `bg-surface-2` |
| `bg-slate-600/500` | `bg-surface-3` |
| `text-white`, `text-slate-100/200` | `text-ink` |
| `text-slate-300` | `text-ink-2` |
| `text-slate-400/500` | `text-muted` |
| `text-slate-600/700` | `text-subtle` |
| `border-slate-700/800` | `border-line` |
| `border-slate-400–600` | `border-line-strong` |
| `cyan`, `green`, `emerald`, `purple`, `blue`… | `accent` |
| `red`, `rose`, `pink` | `danger` |
| `amber`, `yellow`, `orange` | `warning` |
| gradients | solid `from-*` color |
| colored shadows / glows | removed |

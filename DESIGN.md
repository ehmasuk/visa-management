---
name: Visa Management
description: Registry-gated passport custody and payment tracking for a visa-processing office
colors:
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  sidebar: "oklch(0.985 0 0)"
  sidebar-foreground: "oklch(0.145 0 0)"
  sidebar-primary: "oklch(0.205 0 0)"
  sidebar-primary-foreground: "oklch(0.985 0 0)"
  sidebar-border: "oklch(0.922 0 0)"
  sidebar-ring: "oklch(0.708 0 0)"
  status-trust-blue: "#2563eb"
  status-caution-amber: "#d97706"
  status-delivered-emerald: "#059669"
typography:
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
  subtitle:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  serial:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 600
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "26px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-destructive:
    backgroundColor: "{colors.background}"
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  badge-status:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.status-trust-blue}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "20px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: Visa Management

## Overview

**Creative North Star: "The Passport Desk"**

A clean government counter at a visa-processing office: precise paperwork, calm
process, no wasted ink. Every screen is a desk surface — white paper laid flat on
a neutral band, enclosed by a hairline stroke instead of a shadow, and labeled by
a system that speaks in small, exact captions. The palette is intentionally
monochrome: near-black ink is the only element that ever fills a surface, while
color appears exclusively and sparingly inside tinted status pills. The interface
feels confident, orderly, and unhurried — officialese without oppressive density.

Confirmed visual anti-reference: flashy gradients and playful, rounded
mega-brand energy. Nothing glows, bounces, or decorates; depth is a matter of
lines and tonal paper, not shadows and elevation stacks.

**Key Characteristics:**
- Grayscale OKLCH system; color reserved for status pills and destructive relief
- Hairline-outline depth (never drop shadows); glow belongs to focus rings only
- Compact, procedural controls (32px) with strong primary-ink fills
- Passport numbers set in Geist Mono like official serial stamps
- Tinted status windows: ~15% fill behind the hue's 600-step text at medium weight
- Fully supported dark mode (system default, `class` attribute, Ctrl+D toggle)

## Colors

A paper-and-ink palette that keeps every chroma for status and rejection.

### Primary
- **Desk Ink** (oklch(0.205 0 0)): the system's only fill. Primary buttons (took "Receive passport", "Save changes"), active navigation segments, default badges, dark chips. Its near-black value reads as official ink rather than as a brand color.

### Neutral
- **White Paper** (oklch(1 0 0)): page background (`--background`), and card surfaces. Data never sits on gray for gray's sake.
- **Charcoal Text** (oklch(0.145 0 0)): all primary text (`--foreground`), card titles, serial numbers.
- **Half-Black Text** (oklch(0.556 0 0)): secondary text — subtitles, table headers, captions, `text-muted-foreground`.
- **Paper Gray** (oklch(0.97 0 0)): hover/ghost fills, muted card footers, secondary badges, quiet `--muted` backgrounds.
- **Counter Band** (oklch(0.985 0 0)): the top navigation band (`--sidebar`), one step off paper so the desk reads from the nav.
- **Table Border** (oklch(0.922 0 0)): every hairline stroke — inputs, table rules, outline buttons, `--border`/`--input`.
- **Ring Gray** (oklch(0.708 0 0)): focus rings at ~50% opacity, dark-mode borders.

### Status (tint windows, not fills)
Hues never appear as solid fills, borders, or full-text colors — only inside their ~15% tint window, with the hue's 600-step color (blue-600, amber-600, emerald-600) set at medium weight on an otherwise ink-free pill.
- **Trust Blue** (#2563eb on blue-500/15): passport status RECEIVED.
- **Caution Amber** (#d97706 on amber-500/15): PROCESSING, and a pending payment awaiting approval.
- **Delivered Emerald** (#059669 on emerald-500/15): DELIVERED, and PAID.
- **Rejection Red** (oklch(0.577 0.245 27.325) on destructive/10): rejected payment requests; also destructive buttons/badges (aria-invalid borders and rings).

### Named Rules
**The Ink-Only Primary Rule.** The palette's only filled element is near-black ink. No brand hue, no colored buttons; rarity IS the discipline.
**The Tint-Window Rule.** Status hues live in one shape only: a pill with ~15% tinted background and the hue's 600-step text at medium weight. Never solid fills, never colored borders.
**The One-Status Pill Rule.** A passport carries at most one status tint and one payment tint; two pills max on any record row.

## Typography

**Body/UI Font:** Inter (with system-ui fallback), via `--font-sans`
**Serial Font:** Geist Mono (with ui-monospace fallback), via `--font-mono`

**Character:** the Registrar's Ledger pairing — Inter speaks in a neutral tone for desk clerk clarity, while Geist Mono stamps identifiers (passport numbers) like serial markers printed on official documents. Never decorative; the mono carries authority precisely because it is barely styled.

### Hierarchy
- **Headline** (700, 24px, -0.025em tracking): page titles ("Passports", "Edit passport").
- **Title** (600, 18px): section headings inside cards ("New passport entry", "Details").
- **Subtitle** (400, 14px): PageShell subtitle line under the page title, in Half-Black Text.
- **Body** (400, 14px): card content, form text, table cells; 14px is the working size of the desk.
- **Label** (500, 12px, muted): field labels above inputs, table headers (uppercase, wide tracking), captions, timestamp lines.

### Named Rules
**The Serial-Stencil Rule.** Any identifier printed on the physical document — passport numbers — is set in Geist Mono (14px/600). No other text uses mono.

## Layout

A single centered container (`max-w-6xl`, ~1152px) with 24px horizontal gutters and 32px top/bottom padding sits under a full-width navigation band. Content is a vertical stack of full-width cards, each 12–16px from its neighbor. Inside cards, forms use responsive grids — 2 columns at `md` (768px), 4 at `lg` (1024px) — with a consistent 16px column gap and every field label drawn as a small muted caption above its control. Tables of reports render as plain `text-sm` rows with hairline `border-b` separators (last row borderless). Density is moderate: generous line spacing but compact control heights; the desk is orderly, not padded.

## Elevation & Depth

Flat by doctrine — **Outline, not Shadow**. Depth is conveyed by strokes and tonal steps: cards are paper-white surfaces enclosed in a single 1px hairline (`ring-1 ring-foreground/10`), form controls carry a Table Border stroke, and the only glow in the system is the 3px Ring Gray focus ring at 50% opacity, which is a response to focus, not an ornament. Dark mode inverts to near-black paper with tinted borders (`--border: oklch(1 0 0 / 10%)`) and reads through surface contrast rather than added shadows.

### Named Rules
**The Focus-Glow Exception.** The `focus-visible` ring (3px, ring/50%) is the one place light blooms. Hover states stay flat; nothing floats, nothing drops a shadow.

## Shapes

Soft but official corners on a 10px base radius (`--radius: 0.625rem`), scaled by the shadcn multiplier scheme: 6px small tweaks, 8px medium, 10px standard controls (buttons, inputs, selects), 14px cards and image containers, and a full 26px pill reserved exclusively for badges. Control silhouettes are rectangles with uniform rounding; nothing is cut, notched, or angled. Hairline strokes define every container edge; hover surfaces fill with Paper Gray flat color.

## Components

### Buttons
Sorted, compact, procedural: all controls sit at 32px height with 10px radius and speak in ink.
- **Primary:** Desk Ink fill, White Paper text (h-8, rounded-lg, px-2/2.5, `transition-all`, subtle `active:translate-y-px` press).
- **Outline:** White Paper fill with a Table Border stroke; hover fills Paper Gray flat.
- **Ghost:** borderless; hover paints Paper Gray. Used for quiet list actions ("Update", "Save comment", "Sign out").
- **Destructive:** Rejection Red at 10% over paper with red text and red-tinted focus; snowy in dark mode at 20%.
- **Sizes** default 32px, `sm` 28px, `xs` 24px; icon-only variants square.
- **Focus:** 3px ring ring-gray/50; `aria-invalid` swings border + focus to Rejection Red.

### Badges (status pills)
- **Style:** 20px-tall full pills (26px radius), 12px/500 text, transparent 0.5px border.
- **Status states:** Trust Blue / Caution Amber / Delivered Emerald in their tint windows; payment pills use `secondary` (Paper Gray) unless paid → Delivered Emerald; destructive pills for rejections.
- **Default variant:** the only other solid pill — Desk Ink fill with white text (rare, reserved).

### Cards / Containers
- **Shape:** 14px radius, hairline ring-foreground/10 outline, flat fill.
- **Background:** White Paper; internal padding 16px (`--card-spacing`); muted footer variant adds border-top + Paper Gray fill.
- **Shadow Strategy:** none — see Elevation & Depth.
- Standard pattern: flex header row (identity block left, action forms right) then detail caption lines; contents never indent past 16px.

### Inputs / Fields
- **Style:** 32px min-height (textarea grows), White Paper on Table Border, 10px radius, 14px text (text-sm at md+), 12px muted label above.
- **Focus:** border→Ring Gray + 3px ring glow; error marks with Rejection Red border/ring (aria-invalid); disabled dims to 50% with Input-border fill.
- Multi-line comments and single-line fields share the exact stroke language.

### Selects (native)
Same anatomy as inputs; native dropdown arrows kept (registry-backed choices), full width, 10px radius.

### Navigation
- **Band:** Counter Band off-white strip across the top, hairline sidebar-border underline, brand "Visa Management" at 14px/600.
- **Segments:** 12px-radius pill links, 14px/500; active = Desk Ink fill + white text, inactive = sidebar-foreground text with flat Paper Gray hover; active window includes `/detail` routes via prefix match.
- **Right cluster:** user label caption (12px, muted), role badge (`secondary` pill), ghost Sign out button.

### Empty states
A hairline-outlined card holding a centered icon-on-tone composition: paper-gray icon circle treatment, 14px title (600), 14px muted description that instructs the next action ("Enter the first passport above…").

### Toasts (flash feedback)
Transient paper slips that report the action's outcome ("Passport received.", "Comment saved.", entry-style validation errors) as one-line messages detached from any screen position; success stays neutral-text by default with error variant for red occasions.

## Do's and Don'ts

### Do:
- **Do** keep all surfaces flat: white paper, hairline ring strokes (`ring-1 ring-foreground/10` / `border-input`), Paper Gray hover fills.
- **Do** confine every chroma to a pill: ~15% tinted window + the hue's 600-step hue text at medium weight (blue/600, amber/600, emerald/600), or destructive/10 + Rejection Red.
- **Do** set passport numbers in Geist Mono at 14px/600 — the serial stamp treatment.
- **Do** keep interactive controls at 32px with 10px radius and a 3px focus ring glow; label every field in 12px/500 muted caption.
- **Do** align forms on the 2-col/4-col responsive grids with 16px gaps; align table headers uppercase with wide tracking.
- **Do** maintain dispatches for dark mode (class strategy): tinted borders and surface contrast stand in for every light-mode hairline.

### Don't:
- **Don't** drop shadows for depth — ring strokes only; the focus ring is the sole glow.
- **Don't** color buttons, inputs, or backgrounds with palette hues; Desk Ink is the only fill.
- **Don't** use solid status fills or colored borders for status information.
- **Don't** put more than two status pills on one record row (one status + one payment).
- **Don't** apply the pill (26px radius) to anything except badges; controls stay rectangular at their scale step.
- **Don't** uppercase body text or headings — the uppercase voice belongs to table headers and 12px labels only.

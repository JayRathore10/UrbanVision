# DESIGN.md — Modern Bento Dashboard (Light + Dark)

A design system for a professional, modern SaaS dashboard (HR / analytics style), inspired by a soft "bento-grid" look: calm neutral canvas, white rounded cards, oversized numbers, one confident accent color, and pastel status badges. Supports **light and dark mode**.

---

## 1. Design Principles

1. **Calm, not busy** — soft neutral canvas, lots of whitespace, one accent color.
2. **Numbers first** — key metrics are big (40–56px), labels are small and muted.
3. **Bento layout** — everything lives in rounded cards on a grid; cards vary in size but share radius, padding and shadow.
4. **Soft depth** — separation through subtle surface contrast and very light shadows, not heavy borders.
5. **Pill language** — navigation, badges, buttons and filters are pill-shaped; cards are large-radius rectangles.
6. **Both themes are first-class** — every token has a light and a dark value. Never hardcode colors in components.

---

## 2. Tech Stack (recommended)

- React (Vite , .jsx)
- Tailwind CSS (with CSS variables for theming)
- shadcn/ui primitives (Radix) for dropdown, tabs, dialog, tooltip
- Recharts for charts
- lucide-react for icons (stroke 1.5)
- Font: **Inter** (fallback: system-ui)

---

## 3. Color Tokens

Define as CSS variables on `:root` (light) and `.dark` (dark).

### Light theme

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#EEF0F2` | App canvas |
| `--surface` | `#FFFFFF` | Cards, nav pill, modals |
| `--surface-muted` | `#F5F6F8` | Nested panels, inactive bars, inputs |
| `--surface-hover` | `#E9EBEE` | Hover on muted surfaces |
| `--border` | `#E3E5E8` | Dividers, list separators |
| `--text` | `#0E1116` | Headings, big numbers |
| `--text-muted` | `#6B7280` | Labels, captions |
| `--text-subtle` | `#9CA3AF` | Placeholder, axis labels |
| `--accent` | `#4F8FE0` | Primary charts, links, active states |
| `--accent-soft` | `#DCEAFB` | Accent tints |
| `--accent-contrast` | `#FFFFFF` | Text on accent |
| `--inverse` | `#0B0B1A` | Primary CTA button (dark pill) |
| `--inverse-text` | `#FFFFFF` | Text on CTA |
| `--success` / `--success-soft` | `#22C58B` / `#D9F7EA` | "Great", on-time |
| `--warning` / `--warning-soft` | `#F5B83D` / `#FFF1CC` | "Arrived late" |
| `--danger` / `--danger-soft` | `#EF5B5B` / `#FDE2E2` | Absent, errors |
| `--shadow` | `0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.05)` | Cards |

### Dark theme

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0B0D12` | App canvas |
| `--surface` | `#14171E` | Cards, nav pill |
| `--surface-muted` | `#1B1F28` | Nested panels, inactive bars |
| `--surface-hover` | `#232834` | Hover |
| `--border` | `#262B36` | Dividers |
| `--text` | `#F3F5F8` | Headings, numbers |
| `--text-muted` | `#9AA3B2` | Labels |
| `--text-subtle` | `#667085` | Placeholder, axis |
| `--accent` | `#6AA6F5` | Charts, active states |
| `--accent-soft` | `#1C2B44` | Accent tints |
| `--accent-contrast` | `#0B0D12` | Text on accent |
| `--inverse` | `#F3F5F8` | Primary CTA (light pill) |
| `--inverse-text` | `#0B0D12` | Text on CTA |
| `--success` / `--success-soft` | `#34D399` / `#12302A` | |
| `--warning` / `--warning-soft` | `#FBBF24` / `#3A2E10` | |
| `--danger` / `--danger-soft` | `#F87171` / `#3B1717` | |
| `--shadow` | `0 0 0 1px rgba(255,255,255,.04), 0 8px 24px rgba(0,0,0,.35)` | Cards |

**Dark-mode rules:** never use pure `#000` or pure `#FFF` backgrounds/text for large areas; elevate surfaces by getting lighter, not by adding shadows; reduce accent saturation slightly.

### CSS

```css
:root {
  --bg:#EEF0F2; --surface:#FFFFFF; --surface-muted:#F5F6F8; --surface-hover:#E9EBEE;
  --border:#E3E5E8; --text:#0E1116; --text-muted:#6B7280; --text-subtle:#9CA3AF;
  --accent:#4F8FE0; --accent-soft:#DCEAFB; --accent-contrast:#FFFFFF;
  --inverse:#0B0B1A; --inverse-text:#FFFFFF;
  --success:#22C58B; --success-soft:#D9F7EA;
  --warning:#F5B83D; --warning-soft:#FFF1CC;
  --danger:#EF5B5B;  --danger-soft:#FDE2E2;
  --shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.05);
  --radius-card:24px; --radius-inner:16px; --radius-pill:999px;
}
.dark {
  --bg:#0B0D12; --surface:#14171E; --surface-muted:#1B1F28; --surface-hover:#232834;
  --border:#262B36; --text:#F3F5F8; --text-muted:#9AA3B2; --text-subtle:#667085;
  --accent:#6AA6F5; --accent-soft:#1C2B44; --accent-contrast:#0B0D12;
  --inverse:#F3F5F8; --inverse-text:#0B0D12;
  --success:#34D399; --success-soft:#12302A;
  --warning:#FBBF24; --warning-soft:#3A2E10;
  --danger:#F87171;  --danger-soft:#3B1717;
  --shadow:0 0 0 1px rgba(255,255,255,.04),0 8px 24px rgba(0,0,0,.35);
}
body { background:var(--bg); color:var(--text); transition:background .25s, color .25s; }
```

### Tailwind mapping (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        bg: "var(--bg)",
        surface: { DEFAULT: "var(--surface)", muted: "var(--surface-muted)", hover: "var(--surface-hover)" },
        border: "var(--border)",
        content: { DEFAULT: "var(--text)", muted: "var(--text-muted)", subtle: "var(--text-subtle)" },
        accent: { DEFAULT: "var(--accent)", soft: "var(--accent-soft)", contrast: "var(--accent-contrast)" },
        inverse: { DEFAULT: "var(--inverse)", text: "var(--inverse-text)" },
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
        danger:  { DEFAULT: "var(--danger)",  soft: "var(--danger-soft)" },
      },
      borderRadius: { card: "24px", inner: "16px" },
      boxShadow: { card: "var(--shadow)" },
    },
  },
} satisfies Config;
```

---

## 4. Typography

Font: **Inter** (weights 400, 500, 600). Tight letter-spacing on large text.

| Role | Size / Line | Weight | Tracking | Example |
|---|---|---|---|---|
| Display metric | 56 / 60 | 500 | -0.03em | `234`, `92%`, `$2.92M` |
| Page / card title (XL) | 36 / 40 | 500 | -0.02em | "Attendance Overview" |
| Section title | 20 / 28 | 500 | -0.01em | "Engagement Health Score" |
| Body | 14 / 22 | 400 | 0 | Descriptions |
| Label | 13 / 18 | 400–500 | 0 | "Today's Employee Attendances" |
| Caption / axis | 12 / 16 | 400 | 0.01em | Chart labels, meta |
| Badge | 12 / 16 | 500 | 0 | "+2.3%", "Great!" |

Rules: metrics use `font-variant-numeric: tabular-nums`; muted text uses `--text-muted`; max two weights per card.

---

## 5. Spacing, Radius, Elevation

- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48.
- **Card padding:** 24px (32px on large hero cards). **Grid gap:** 16–20px.
- **Radius:** cards `24px`, nested panels `16px`, inputs/buttons/badges/nav `999px`, icon tiles `14px`.
- **Elevation:** one level only — `--shadow` on cards. Nested panels have no shadow, just `--surface-muted`.
- **Borders:** avoid on cards. Use 1px `--border` only for list dividers and inputs.

---

## 6. Layout

### App shell
- Canvas `--bg`, content max-width **1440px**, outer padding 24px.
- **Top navigation** (no sidebar): logo pill (left) · center pill-nav · search pill + avatar (right).
- Sticky top bar with `backdrop-filter: blur(12px)` over `--bg` at 80% opacity.

### Dashboard grid (desktop ≥1280px)
12-column CSS grid, gap 20px.

```
| Attendance Overview (cols 1–8)          | Calendar + Agenda (cols 9–12, spans 2 rows) |
| Payroll Snapshot (1–4) | Engagement (5–8) |                                            |
| Workload Balance (1–4) | Recent Attendance (5–12) ...                                |
```

### Breakpoints
- `≥1280`: 12-col bento as above.
- `768–1279`: 6 columns; right column drops under the main area.
- `<768`: single column; top nav collapses into a hamburger + bottom sheet; metrics stack.

---

## 7. Components

### 7.1 Top nav
- Container: transparent. Items sit in a `surface` pill (`h-12`, `px-5`).
- **Active item:** `surface` pill with `shadow-card` and `text` color; inactive items `text-muted`, hover → `text`.
- Logo: circular dark mark + wordmark inside a `surface` pill.
- Search: pill, `surface`, search icon, placeholder `text-subtle`, `⌘K` hint.

### 7.2 Card
```tsx
<section className="bg-surface rounded-card shadow-card p-6">…</section>
```
- Header row: **icon tile** (44×44, `surface`, radius 14, 1.5px stroke icon) + title.
- Optional right-aligned control (month dropdown, "View all" link).
- Hero cards may use `bg-surface-muted` (like the large Attendance card) with nested white cards inside.

### 7.3 Metric block
- Big number (Display) + small suffix in `text-muted` (e.g. `/250`).
- Label below in `text-muted`, 13px.
- Optional delta badge floating at top-right of the number.

### 7.4 Badges / chips
Pill, `px-2.5 py-1`, 12px/500.
- Delta: `accent` bg with `accent-contrast` text (`+2.3%`).
- Success: `success-soft` bg, `success` text (`Great!`).
- Warning: `warning-soft` bg, `warning` text (`Arrived Late`).
- Danger: `danger-soft` bg, `danger` text (`Absent`).
- In dark mode soft backgrounds are deep tints, text stays vivid.

### 7.5 Buttons
- **Primary CTA:** `inverse` bg, `inverse-text`, pill, `h-11 px-6`, hover: lift 1px + 90% opacity.
- **Secondary:** `surface` bg + 1px `border`, pill.
- **Ghost / icon:** circular 40–48px, `surface` bg, icon centered.
- **AI action** (e.g. "Get AI Insight"): small accent pill with soft glow `0 4px 14px color-mix(in srgb, var(--accent) 40%, transparent)`.
- Focus ring: 2px `--accent` with 2px offset on every interactive element.

### 7.6 Bar chart (weekly attendance)
- Rounded **pill bars** (`radius: 999`), width ~22px, gap 14px.
- Inactive bars: `surface-muted`. Highlighted/selected bars: `accent`.
- Dashed average line in `border` color with a floating label (`07:43:23 AVERAGE HOURS`) in caption style.
- Weekend bars rendered as short dashes (no data).
- X-axis labels: caption, `text-subtle`. Hide Y-axis and gridlines.
- Tooltip: `surface` card, shadow, 12px text.

### 7.7 Calendar strip + agenda
- Header: month/year in XL size.
- Week strip: weekday (caption, muted) over date (20px, muted → `text` when active); active day gets `accent` pill background; dots below = event count.
- Agenda list: rows separated by 1px `border`; title 15px/500 (truncate), time 13px muted.
- The "Now" item gets an `accent` dot and `Now` label.

### 7.8 List rows (Recent attendance)
- 48px circular avatar · name (16px/500) + status badge inline · department in muted caption.
- Row hover: `surface-muted`, radius 16.

### 7.9 Progress / score
- Engagement score: big number + status badge; optional radial or thin linear bar in `success`.

### 7.10 Inputs & dropdowns
- Pill inputs, `surface-muted` bg, no border until focus (then 2px `accent` ring).
- Dropdown trigger: text + chevron, no box (`August, 2025 ⌄`); menu is a `surface` card with shadow, radius 16.

---

## 8. Dark / Light Mode Implementation

Behavior: **System by default**, user can override (Light / Dark / System). Persist in `localStorage`. No flash on load.

### Inline script (in `index.html` `<head>`, prevents flash)
```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("theme") || "system";
      var dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    } catch (e) {}
  })();
</script>
```

### `useTheme.ts`
```ts
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const apply = (theme: Theme) => {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
    apply(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme === "system" && apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return { theme, setTheme };
}
```

### Toggle UI
- Circular 44px icon button (Sun / Moon from lucide) in the top-right of the nav, with a small 3-option dropdown (Light, Dark, System).
- Icon cross-fades + rotates 90° over 200ms.

### Chart theming
Recharts colors must read CSS variables, e.g. `fill="var(--accent)"` and `fill="var(--surface-muted)"`, so charts update instantly with the theme.

---

## 9. Motion

- Duration: 150ms (hover), 250ms (theme/color), 400ms (enter).
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Card enter: fade + translateY(8px → 0), staggered 40ms.
- Bars grow from bottom on mount (400ms, staggered 20ms).
- Number count-up on first load (600ms).
- Respect `prefers-reduced-motion`: disable transforms/count-up.

---

## 10. Iconography & Imagery

- lucide-react, 20px inside 44px tiles, stroke 1.5, color `text`.
- Avatars: circular, 1:1, soft pastel fallback with initials.
- No heavy gradients or glassmorphism; at most a subtle accent glow on AI actions.

---

## 11. Accessibility

- Text contrast ≥ 4.5:1 (muted text ≥ 4.5:1 on its surface in both themes — verify `--text-muted` on `--surface`).
- Never rely on color alone for status: badges include text (and optionally an icon).
- Full keyboard navigation, visible focus ring, `aria-label` on icon-only buttons.
- Charts have a visually hidden data table or `aria-label` summary.
- Hit targets ≥ 40×40px.

---

## 12. Suggested Folder Structure

```
src/
  components/
    layout/      TopNav.tsx, ThemeToggle.tsx, PageShell.tsx
    ui/          Card.tsx, Badge.tsx, Button.tsx, IconTile.tsx, MetricBlock.tsx
    charts/      AttendanceBars.tsx
    widgets/     AttendanceOverview.tsx, PayrollSnapshot.tsx, EngagementScore.tsx,
                 WorkloadMonitor.tsx, CalendarAgenda.tsx, RecentAttendance.tsx
  hooks/         useTheme.ts
  styles/        globals.css   (tokens from section 3)
  lib/           cn.ts, format.ts
```

---

## 13. Ready-to-Paste Prompt (for Claude / Cursor / Copilot / v0)

> Build a professional, modern **[your app type, e.g. HR / project / analytics] dashboard** using **React + TypeScript + Tailwind CSS + Recharts + lucide-react (Inter font)**. Follow the attached `design.md` exactly.
>
> **Visual style:** soft neutral canvas with white rounded "bento" cards (24px radius, very light shadow), pill-shaped navigation and badges, oversized numeric metrics, a single blue accent, and pastel status badges (green, yellow, red). Calm, spacious, premium SaaS look — no heavy borders or gradients.
>
> **Theming:** full **light and dark mode** using CSS variables (`:root` and `.dark`), Tailwind `darkMode: "class"`, a Light/Dark/System toggle persisted in `localStorage`, and a pre-hydration script to avoid flash. Charts must use the CSS variables so they switch with the theme.
>
> **Layout:** sticky top nav (logo pill, centered pill tabs, search pill, theme toggle, avatar). 12-column bento grid: a large Attendance Overview card with big metrics and a rounded-pill bar chart (highlighted bars in accent, dashed average line, "Get AI Insight" pill button); a Payroll snapshot card with a delta badge; an Engagement Health Score card with a status badge; a Workload Balance card; a right column with a week calendar strip and agenda list; and a Recent Attendance list with avatars and status badges.
>
> **Requirements:** responsive (desktop 12-col → tablet 6-col → mobile 1-col), accessible (WCAG AA contrast, visible focus rings, aria-labels), subtle motion (staggered card fade-in, bars grow in, number count-up, respects `prefers-reduced-motion`), reusable components (`Card`, `Badge`, `Button`, `IconTile`, `MetricBlock`, `AttendanceBars`), and typed mock data in a separate file. Output clean, production-ready code with the folder structure in `design.md`.

---

## 14. Do / Don't

**Do**
- Use tokens for every color; test every screen in both themes.
- Keep one accent color per view; use semantic colors only for status.
- Keep cards visually consistent in radius, padding, and shadow.

**Don't**
- Don't use pure black/white backgrounds, hard borders around cards, or more than two font weights per card.
- Don't add more than one elevation level.
- Don't hardcode hex values in components.# DESIGN.md — Modern Bento Dashboard (Light + Dark)

A design system for a professional, modern SaaS dashboard (HR / analytics style), inspired by a soft "bento-grid" look: calm neutral canvas, white rounded cards, oversized numbers, one confident accent color, and pastel status badges. Supports **light and dark mode**.

---

## 1. Design Principles

1. **Calm, not busy** — soft neutral canvas, lots of whitespace, one accent color.
2. **Numbers first** — key metrics are big (40–56px), labels are small and muted.
3. **Bento layout** — everything lives in rounded cards on a grid; cards vary in size but share radius, padding and shadow.
4. **Soft depth** — separation through subtle surface contrast and very light shadows, not heavy borders.
5. **Pill language** — navigation, badges, buttons and filters are pill-shaped; cards are large-radius rectangles.
6. **Both themes are first-class** — every token has a light and a dark value. Never hardcode colors in components.

---

## 2. Tech Stack (recommended)

- React + TypeScript (Vite or Next.js)
- Tailwind CSS (with CSS variables for theming)
- shadcn/ui primitives (Radix) for dropdown, tabs, dialog, tooltip
- Recharts for charts
- lucide-react for icons (stroke 1.5)
- Font: **Inter** (fallback: system-ui)

---

## 3. Color Tokens

Define as CSS variables on `:root` (light) and `.dark` (dark).

### Light theme

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#EEF0F2` | App canvas |
| `--surface` | `#FFFFFF` | Cards, nav pill, modals |
| `--surface-muted` | `#F5F6F8` | Nested panels, inactive bars, inputs |
| `--surface-hover` | `#E9EBEE` | Hover on muted surfaces |
| `--border` | `#E3E5E8` | Dividers, list separators |
| `--text` | `#0E1116` | Headings, big numbers |
| `--text-muted` | `#6B7280` | Labels, captions |
| `--text-subtle` | `#9CA3AF` | Placeholder, axis labels |
| `--accent` | `#4F8FE0` | Primary charts, links, active states |
| `--accent-soft` | `#DCEAFB` | Accent tints |
| `--accent-contrast` | `#FFFFFF` | Text on accent |
| `--inverse` | `#0B0B1A` | Primary CTA button (dark pill) |
| `--inverse-text` | `#FFFFFF` | Text on CTA |
| `--success` / `--success-soft` | `#22C58B` / `#D9F7EA` | "Great", on-time |
| `--warning` / `--warning-soft` | `#F5B83D` / `#FFF1CC` | "Arrived late" |
| `--danger` / `--danger-soft` | `#EF5B5B` / `#FDE2E2` | Absent, errors |
| `--shadow` | `0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.05)` | Cards |

### Dark theme

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0B0D12` | App canvas |
| `--surface` | `#14171E` | Cards, nav pill |
| `--surface-muted` | `#1B1F28` | Nested panels, inactive bars |
| `--surface-hover` | `#232834` | Hover |
| `--border` | `#262B36` | Dividers |
| `--text` | `#F3F5F8` | Headings, numbers |
| `--text-muted` | `#9AA3B2` | Labels |
| `--text-subtle` | `#667085` | Placeholder, axis |
| `--accent` | `#6AA6F5` | Charts, active states |
| `--accent-soft` | `#1C2B44` | Accent tints |
| `--accent-contrast` | `#0B0D12` | Text on accent |
| `--inverse` | `#F3F5F8` | Primary CTA (light pill) |
| `--inverse-text` | `#0B0D12` | Text on CTA |
| `--success` / `--success-soft` | `#34D399` / `#12302A` | |
| `--warning` / `--warning-soft` | `#FBBF24` / `#3A2E10` | |
| `--danger` / `--danger-soft` | `#F87171` / `#3B1717` | |
| `--shadow` | `0 0 0 1px rgba(255,255,255,.04), 0 8px 24px rgba(0,0,0,.35)` | Cards |

**Dark-mode rules:** never use pure `#000` or pure `#FFF` backgrounds/text for large areas; elevate surfaces by getting lighter, not by adding shadows; reduce accent saturation slightly.

### CSS

```css
:root {
  --bg:#EEF0F2; --surface:#FFFFFF; --surface-muted:#F5F6F8; --surface-hover:#E9EBEE;
  --border:#E3E5E8; --text:#0E1116; --text-muted:#6B7280; --text-subtle:#9CA3AF;
  --accent:#4F8FE0; --accent-soft:#DCEAFB; --accent-contrast:#FFFFFF;
  --inverse:#0B0B1A; --inverse-text:#FFFFFF;
  --success:#22C58B; --success-soft:#D9F7EA;
  --warning:#F5B83D; --warning-soft:#FFF1CC;
  --danger:#EF5B5B;  --danger-soft:#FDE2E2;
  --shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.05);
  --radius-card:24px; --radius-inner:16px; --radius-pill:999px;
}
.dark {
  --bg:#0B0D12; --surface:#14171E; --surface-muted:#1B1F28; --surface-hover:#232834;
  --border:#262B36; --text:#F3F5F8; --text-muted:#9AA3B2; --text-subtle:#667085;
  --accent:#6AA6F5; --accent-soft:#1C2B44; --accent-contrast:#0B0D12;
  --inverse:#F3F5F8; --inverse-text:#0B0D12;
  --success:#34D399; --success-soft:#12302A;
  --warning:#FBBF24; --warning-soft:#3A2E10;
  --danger:#F87171;  --danger-soft:#3B1717;
  --shadow:0 0 0 1px rgba(255,255,255,.04),0 8px 24px rgba(0,0,0,.35);
}
body { background:var(--bg); color:var(--text); transition:background .25s, color .25s; }
```

### Tailwind mapping (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        bg: "var(--bg)",
        surface: { DEFAULT: "var(--surface)", muted: "var(--surface-muted)", hover: "var(--surface-hover)" },
        border: "var(--border)",
        content: { DEFAULT: "var(--text)", muted: "var(--text-muted)", subtle: "var(--text-subtle)" },
        accent: { DEFAULT: "var(--accent)", soft: "var(--accent-soft)", contrast: "var(--accent-contrast)" },
        inverse: { DEFAULT: "var(--inverse)", text: "var(--inverse-text)" },
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
        danger:  { DEFAULT: "var(--danger)",  soft: "var(--danger-soft)" },
      },
      borderRadius: { card: "24px", inner: "16px" },
      boxShadow: { card: "var(--shadow)" },
    },
  },
} satisfies Config;
```

---

## 4. Typography

Font: **Inter** (weights 400, 500, 600). Tight letter-spacing on large text.

| Role | Size / Line | Weight | Tracking | Example |
|---|---|---|---|---|
| Display metric | 56 / 60 | 500 | -0.03em | `234`, `92%`, `$2.92M` |
| Page / card title (XL) | 36 / 40 | 500 | -0.02em | "Attendance Overview" |
| Section title | 20 / 28 | 500 | -0.01em | "Engagement Health Score" |
| Body | 14 / 22 | 400 | 0 | Descriptions |
| Label | 13 / 18 | 400–500 | 0 | "Today's Employee Attendances" |
| Caption / axis | 12 / 16 | 400 | 0.01em | Chart labels, meta |
| Badge | 12 / 16 | 500 | 0 | "+2.3%", "Great!" |

Rules: metrics use `font-variant-numeric: tabular-nums`; muted text uses `--text-muted`; max two weights per card.

---

## 5. Spacing, Radius, Elevation

- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48.
- **Card padding:** 24px (32px on large hero cards). **Grid gap:** 16–20px.
- **Radius:** cards `24px`, nested panels `16px`, inputs/buttons/badges/nav `999px`, icon tiles `14px`.
- **Elevation:** one level only — `--shadow` on cards. Nested panels have no shadow, just `--surface-muted`.
- **Borders:** avoid on cards. Use 1px `--border` only for list dividers and inputs.

---

## 6. Layout

### App shell
- Canvas `--bg`, content max-width **1440px**, outer padding 24px.
- **Top navigation** (no sidebar): logo pill (left) · center pill-nav · search pill + avatar (right).
- Sticky top bar with `backdrop-filter: blur(12px)` over `--bg` at 80% opacity.

### Dashboard grid (desktop ≥1280px)
12-column CSS grid, gap 20px.

```
| Attendance Overview (cols 1–8)          | Calendar + Agenda (cols 9–12, spans 2 rows) |
| Payroll Snapshot (1–4) | Engagement (5–8) |                                            |
| Workload Balance (1–4) | Recent Attendance (5–12) ...                                |
```

### Breakpoints
- `≥1280`: 12-col bento as above.
- `768–1279`: 6 columns; right column drops under the main area.
- `<768`: single column; top nav collapses into a hamburger + bottom sheet; metrics stack.

---

## 7. Components

### 7.1 Top nav
- Container: transparent. Items sit in a `surface` pill (`h-12`, `px-5`).
- **Active item:** `surface` pill with `shadow-card` and `text` color; inactive items `text-muted`, hover → `text`.
- Logo: circular dark mark + wordmark inside a `surface` pill.
- Search: pill, `surface`, search icon, placeholder `text-subtle`, `⌘K` hint.

### 7.2 Card
```tsx
<section className="bg-surface rounded-card shadow-card p-6">…</section>
```
- Header row: **icon tile** (44×44, `surface`, radius 14, 1.5px stroke icon) + title.
- Optional right-aligned control (month dropdown, "View all" link).
- Hero cards may use `bg-surface-muted` (like the large Attendance card) with nested white cards inside.

### 7.3 Metric block
- Big number (Display) + small suffix in `text-muted` (e.g. `/250`).
- Label below in `text-muted`, 13px.
- Optional delta badge floating at top-right of the number.

### 7.4 Badges / chips
Pill, `px-2.5 py-1`, 12px/500.
- Delta: `accent` bg with `accent-contrast` text (`+2.3%`).
- Success: `success-soft` bg, `success` text (`Great!`).
- Warning: `warning-soft` bg, `warning` text (`Arrived Late`).
- Danger: `danger-soft` bg, `danger` text (`Absent`).
- In dark mode soft backgrounds are deep tints, text stays vivid.

### 7.5 Buttons
- **Primary CTA:** `inverse` bg, `inverse-text`, pill, `h-11 px-6`, hover: lift 1px + 90% opacity.
- **Secondary:** `surface` bg + 1px `border`, pill.
- **Ghost / icon:** circular 40–48px, `surface` bg, icon centered.
- **AI action** (e.g. "Get AI Insight"): small accent pill with soft glow `0 4px 14px color-mix(in srgb, var(--accent) 40%, transparent)`.
- Focus ring: 2px `--accent` with 2px offset on every interactive element.

### 7.6 Bar chart (weekly attendance)
- Rounded **pill bars** (`radius: 999`), width ~22px, gap 14px.
- Inactive bars: `surface-muted`. Highlighted/selected bars: `accent`.
- Dashed average line in `border` color with a floating label (`07:43:23 AVERAGE HOURS`) in caption style.
- Weekend bars rendered as short dashes (no data).
- X-axis labels: caption, `text-subtle`. Hide Y-axis and gridlines.
- Tooltip: `surface` card, shadow, 12px text.

### 7.7 Calendar strip + agenda
- Header: month/year in XL size.
- Week strip: weekday (caption, muted) over date (20px, muted → `text` when active); active day gets `accent` pill background; dots below = event count.
- Agenda list: rows separated by 1px `border`; title 15px/500 (truncate), time 13px muted.
- The "Now" item gets an `accent` dot and `Now` label.

### 7.8 List rows (Recent attendance)
- 48px circular avatar · name (16px/500) + status badge inline · department in muted caption.
- Row hover: `surface-muted`, radius 16.

### 7.9 Progress / score
- Engagement score: big number + status badge; optional radial or thin linear bar in `success`.

### 7.10 Inputs & dropdowns
- Pill inputs, `surface-muted` bg, no border until focus (then 2px `accent` ring).
- Dropdown trigger: text + chevron, no box (`August, 2025 ⌄`); menu is a `surface` card with shadow, radius 16.

---

## 8. Dark / Light Mode Implementation

Behavior: **System by default**, user can override (Light / Dark / System). Persist in `localStorage`. No flash on load.

### Inline script (in `index.html` `<head>`, prevents flash)
```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("theme") || "system";
      var dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    } catch (e) {}
  })();
</script>
```

### `useTheme.ts`
```ts
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const apply = (theme: Theme) => {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
    apply(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme === "system" && apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return { theme, setTheme };
}
```

### Toggle UI
- Circular 44px icon button (Sun / Moon from lucide) in the top-right of the nav, with a small 3-option dropdown (Light, Dark, System).
- Icon cross-fades + rotates 90° over 200ms.

### Chart theming
Recharts colors must read CSS variables, e.g. `fill="var(--accent)"` and `fill="var(--surface-muted)"`, so charts update instantly with the theme.

---

## 9. Motion

- Duration: 150ms (hover), 250ms (theme/color), 400ms (enter).
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Card enter: fade + translateY(8px → 0), staggered 40ms.
- Bars grow from bottom on mount (400ms, staggered 20ms).
- Number count-up on first load (600ms).
- Respect `prefers-reduced-motion`: disable transforms/count-up.

---

## 10. Iconography & Imagery

- lucide-react, 20px inside 44px tiles, stroke 1.5, color `text`.
- Avatars: circular, 1:1, soft pastel fallback with initials.
- No heavy gradients or glassmorphism; at most a subtle accent glow on AI actions.

---

## 11. Accessibility

- Text contrast ≥ 4.5:1 (muted text ≥ 4.5:1 on its surface in both themes — verify `--text-muted` on `--surface`).
- Never rely on color alone for status: badges include text (and optionally an icon).
- Full keyboard navigation, visible focus ring, `aria-label` on icon-only buttons.
- Charts have a visually hidden data table or `aria-label` summary.
- Hit targets ≥ 40×40px.

---

## 12. Suggested Folder Structure

```
src/
  components/
    layout/      TopNav.tsx, ThemeToggle.tsx, PageShell.tsx
    ui/          Card.tsx, Badge.tsx, Button.tsx, IconTile.tsx, MetricBlock.tsx
    charts/      AttendanceBars.tsx
    widgets/     AttendanceOverview.tsx, PayrollSnapshot.tsx, EngagementScore.tsx,
                 WorkloadMonitor.tsx, CalendarAgenda.tsx, RecentAttendance.tsx
  hooks/         useTheme.ts
  styles/        globals.css   (tokens from section 3)
  lib/           cn.ts, format.ts
```

---

## 13. Ready-to-Paste Prompt (for Claude / Cursor / Copilot / v0)

> Build a professional, modern **[your app type, e.g. HR / project / analytics] dashboard** using **React + TypeScript + Tailwind CSS + Recharts + lucide-react (Inter font)**. Follow the attached `design.md` exactly.
>
> **Visual style:** soft neutral canvas with white rounded "bento" cards (24px radius, very light shadow), pill-shaped navigation and badges, oversized numeric metrics, a single blue accent, and pastel status badges (green, yellow, red). Calm, spacious, premium SaaS look — no heavy borders or gradients.
>
> **Theming:** full **light and dark mode** using CSS variables (`:root` and `.dark`), Tailwind `darkMode: "class"`, a Light/Dark/System toggle persisted in `localStorage`, and a pre-hydration script to avoid flash. Charts must use the CSS variables so they switch with the theme.
>
> **Layout:** sticky top nav (logo pill, centered pill tabs, search pill, theme toggle, avatar). 12-column bento grid: a large Attendance Overview card with big metrics and a rounded-pill bar chart (highlighted bars in accent, dashed average line, "Get AI Insight" pill button); a Payroll snapshot card with a delta badge; an Engagement Health Score card with a status badge; a Workload Balance card; a right column with a week calendar strip and agenda list; and a Recent Attendance list with avatars and status badges.
>
> **Requirements:** responsive (desktop 12-col → tablet 6-col → mobile 1-col), accessible (WCAG AA contrast, visible focus rings, aria-labels), subtle motion (staggered card fade-in, bars grow in, number count-up, respects `prefers-reduced-motion`), reusable components (`Card`, `Badge`, `Button`, `IconTile`, `MetricBlock`, `AttendanceBars`), and typed mock data in a separate file. Output clean, production-ready code with the folder structure in `design.md`.

---

## 14. Do / Don't

**Do**
- Use tokens for every color; test every screen in both themes.
- Keep one accent color per view; use semantic colors only for status.
- Keep cards visually consistent in radius, padding, and shadow.

**Don't**
- Don't use pure black/white backgrounds, hard borders around cards, or more than two font weights per card.
- Don't add more than one elevation level.
- Don't hardcode hex values in components.
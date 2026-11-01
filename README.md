# NOCTIS — Electric Automobiles

> *"The city is in total blackout. The car's light is the only light in the world."*

A minimal, premium, single-page scrollytelling experience engineered with pure HTML5, CSS, and vanilla JavaScript.

---

## ⚡ Architectural Rules & Technologies
- **Vanilla Core**: Zero frameworks, zero build tools, zero npm packages, zero external libraries (no React, GSAP, Lenis, or Tailwind).
- **Canvas-Scrubbed Scrollytelling**: Dynamic image sequence rendering executed directly on HTML5 `<canvas>` scaled to `devicePixelRatio` (capped at 2).
- **Aesthetic Principles**:
  - Flat solid colors, 1px hairlines, photography, and precision typography.
  - **Zero gradients** (linear, radial, conic, or text).
  - **Zero glassmorphism** (no backdrop-filter, no frosted panels).
  - **Zero glows, dropshadows, or rounded bubbly cards**.

---

## 📐 Design Tokens
| Token | Hex / Value | Purpose |
| :--- | :--- | :--- |
| `--asphalt` | `#07080A` | Deep obsidian page background |
| `--graphite` | `#121418` | Neutral structural panels |
| `--fog` | `#8A8F98` | Secondary typography & HUD labels |
| `--bone` | `#EDEAE4` | Primary high-contrast typography |
| `--xenon` | `#CFE3FF` | Razor-thin light accents & signatures |
| `--taillight` | `#E1251B` | Active HUD ticks & button indicator |
| `--hairline` | `rgba(237, 234, 228, 0.12)` | Subtle 1px structural gridlines |

### Typography
- **Display**: [Archivo](https://fonts.google.com/specimen/Archivo) variable font with expanded width axis (`wdth` 125, font-stretch 125%, uppercase, letter-spacing `0.02em`, size `clamp(40px, 7vw, 120px)`).
- **Body**: [Inter](https://fonts.google.com/specimen/Inter) (weights 400/500, line-height 1.6, max 52ch).
- **HUD / Telemetry**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (weight 400, uppercase, letter-spacing `0.12em`).

---

## 🏎️ Sections & Scrollytelling Features

### 1. Preloader & Progressive Loading
- Minimalist black screen with expanded Archivo wordmark.
- Center-outward xenon progress bar with synchronized `000`–`100` monospace counter.
- Loads hero frames 1–40 before revealing the site, with background streaming of remaining hero and dismantle frames.

### 2. Section 1 — Hero (Pinned, 600vh)
- Scrubbed 598-frame cinematic arrival sequence in a blackout city.
- Pinned stage with smooth lerp scrubbing (`current += (target - current) * 0.15`).
- Left-edge monospace HUD:
  - Active chapter counter (`01/04` – `04/04`) with taillight-red tick.
  - Velocity counter (`000` → `118 KM/H`).
  - Odometer (`0.0` → `4.2 KM`).
- Four text chapters appearing in empty sky with masked 0.9s line reveals.
- Fades to solid black over the final 5% of scroll.

### 3. Section 2 — Statement (100vh)
- *"Every part was designed to disappear into one line of light."*
- Words illuminate from 15% opacity to 100% opacity sequentially driven by viewport scroll position.

### 4. Section 3 — Dismantle (Pinned, 350vh)
- Scrubbed 176-frame technical disassembly sequence.
- After 70% scroll, four callout points fade in with 1px hairlines:
  - `BODY` — Carbon composite monocoque
  - `BATTERY` — 110 kWh structural pack
  - `DRIVE` — Dual axial-flux motors, 680 kW
  - `LIGHT` — Single-line LED signature

### 5. Section 4 — The Lineup (100vh)
- 5 vertical slides in an interactive hover accordion (debounced 80ms).
- GT-E open by default; hovered or keyboard-selected slides expand via `flex-grow: 5.2` over 0.7s with site easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- Vehicle drives in 6% from left upon opening.
- Models:
  1. **GT-E**: Grand Tourer (640 km · 3.1 s · 680 kW)
  2. **S**: Sport Sedan (600 km · 3.6 s · 520 kW)
  3. **X**: Coupe SUV (560 km · 4.2 s · 480 kW)
  4. **R**: Track Spec Coupe (420 km · 2.4 s · 900 kW)
  5. **ONE**: Concept Hypercar (< 1.9 s · 1100 kW)
- Full keyboard accessibility (`ArrowLeft`, `ArrowRight`, `Home`, `End`, `aria-expanded`).
- Mobile adaptive: stacks into 72px expandable rows.

### 6. Section 5 — Reserve (100vh)
- High-contrast allocation call-to-action.
- Xenon outline button with red active tick on hover.

### 7. Global Headlight Cursor (Desktop)
- 6px xenon dot inside a 28px ring following pointer with lerp 0.18.
- Morphs into a 44×2px light signature with contextual mono labels (`VIEW`, `RESERVE`, `OPEN`, `CONFIGURE`).
- 120ms white flash on mousedown.
- Automatic fallback on touch devices and `prefers-reduced-motion`.

---

## 🚀 Running Locally

```bash
# Option 1: PowerShell Built-in Server
powershell -ExecutionPolicy Bypass -File server.ps1 -Port 5500

# Option 2: Python 3
python -m http.server 5500

# Option 3: VS Code
Right-click index.html -> "Open with Live Server"
```

Open `http://localhost:5500/` in your browser.

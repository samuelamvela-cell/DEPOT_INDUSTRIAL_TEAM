---
name: AgroPredict System
colors:
  surface: '#ecfef1'
  surface-dim: '#cdded2'
  surface-bright: '#ecfef1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f8eb'
  surface-container: '#e0f2e6'
  surface-container-high: '#dbede0'
  surface-container-highest: '#d5e7da'
  on-surface: '#101f17'
  on-surface-variant: '#404940'
  inverse-surface: '#24342b'
  inverse-on-surface: '#e3f5e8'
  outline: '#707a6f'
  outline-variant: '#bfc9bd'
  surface-tint: '#206c3b'
  primary: '#005226'
  on-primary: '#ffffff'
  primary-container: '#1f6b3a'
  on-primary-container: '#9ce9ab'
  inverse-primary: '#8cd79b'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#fdbf40'
  on-secondary-container: '#6f4e00'
  tertiary: '#004686'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c5ea7'
  on-tertiary-container: '#c3d8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a7f4b6'
  primary-fixed-dim: '#8cd79b'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#fabc3e'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a6c8ff'
  on-tertiary-fixed: '#001c3b'
  on-tertiary-fixed-variant: '#004787'
  background: '#ecfef1'
  on-background: '#101f17'
  surface-variant: '#d5e7da'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system serves smallholder farmers, agronomists, and field advisors across Cameroon and Francophone West/Central Africa. Its core philosophy bridges advanced NASA earth observation telemetry with agrarian field realities, creating an interface that feels dependable, warm, scientific, and profoundly accessible.

The aesthetic blends **Modern Earth-Centric Ergonomics** with **Data Humanism**:
- **Field-Ready Contrast & Warmth:** Soft warm backgrounds reduce glare under direct sunlight without the harshness of stark digital whites.
- **Approachable Science:** Complex satellite datasets (precipitation, soil moisture, vegetative vigor) are translated into clear, actionable visual metaphors and plain-language indicators rather than raw mathematical telemetry.
- **Empowering Optimism:** Visual weight emphasizes positive agrarian outcomes, viable crop rotations, and yield stability using rich organic tones and lucid, human-scale typography.

## Colors
The palette grounds deep satellite intelligence within the tactile realities of fertile earth and lush foliage. 

- **Primary Deep Green (`#1F6B3A`):** Core calls-to-action, high-level navigation, and affirmative selections.
- **Primary Light Green (`#4CAF6A`):** Vegetative vitality, yield growth indicators, favorable conditions, and validation states.
- **Accent Ochre / Gold (`#E0A526`):** Highlighting the "Scénario Recommandé" (Recommended Scenario), economic viability, harvest metrics, and critical focus states.
- **Earth Brown (`#7A5230`):** Soil classification tiers, texture indicators, and root-zone moisture metrics.
- **NASA Satellite Blue (`#1E5FA8`):** Satellite metadata origins (POWER, IMERG, SMAP, MODIS), precipitation layers, hydrological indexes, and contextual information.
- **Background Canvas (`#F7F8F3`):** Warm sun-attenuated off-white designed specifically for readability on mid-tier mobile displays under bright outdoor field lighting.
- **Surfaces (`#FFFFFF`):** High-clarity elevated containers and data comparison cards.
- **Typography:** Primary dark text (`#1B2A22`) ensures a 4.5:1+ contrast ratio against all light surfaces. Secondary text (`#5B6B62`) provides soft yet legible hierarchy for non-critical metadata.
- **Functional Semantics:** Danger (`#D64545`) highlights drought/pest alerts; Warning (`#F59E0B`) flags dry spells or moisture stress; Info (`#1E5FA8`) identifies algorithmic and sensor disclosures.

## Typography
Typographic rules adhere strictly to readability in outdoor environments:
- **Zero Sub-16px Body Copy:** Standard descriptive text must never fall below `16px` (`body-md`) to ensure legibility on low-cost devices and under vibrating field conditions (e.g., in transit or on farm machinery).
- **Titles (Plus Jakarta Sans):** Warm, open counters and humanist geometric terminals provide a contemporary, optimistic, and welcoming tone.
- **Running Copy & Data (Inter):** High x-height, clear distinction between similar glyphs, and superior rendering across varying Android resolutions.
- **Financial & Agronomic Numbers:** All currency displays (`FCFA`), hectare yields (`kg/ha`), and precipitation volumes (`mm`) use `body-bold` or `headline-md` with tabular numerals enabled to ensure vertical alignment in rotation comparison tables.

## Layout & Spacing
The layout relies on a fluid responsive grid structured around handheld touch interactions in agrarian contexts:

- **Breakpoints:**
  - **Mobile (0–640px):** 4 columns, 16px (`1rem`) gutters, 16px (`1rem`) outer margins. Full-width stacked rotation cards.
  - **Tablet (641–1024px):** 8 columns, 24px (`1.5rem`) gutters, 32px (`2rem`) outer margins. Side-by-side scenario comparisons.
  - **Desktop (1025px+):** 12 columns, 32px (`2rem`) gutters, max-width container 1280px with auto-centering.
- **Physical Touch Target Guarantee:** All actionable components maintain a strict physical minimum bound of `48px x 48px`, surrounded by at least `space-sm` (8px) of clearance to prevent mis-taps when wearing utility gloves or operating single-handed.
- **Section Rhythm:** Group operational inputs and weather telemetry using `space-lg`, reserving `space-xl` strictly for delineating separate crop cycles or rotation timelines.

## Elevation & Depth
Depth must feel organic and diffused, avoiding harsh drop-shadows that distract under intense natural light.

- **Surface Tiers:**
  - **Level 0 (Canvas):** Tone `#F7F8F3`. Background foundation for the entire application.
  - **Level 1 (Cards & Modules):** Solid `#FFFFFF` surfaces with a 1px solid stroke (`#E5E8DE`) and an ultra-soft ambient shadow: `box-shadow: 0 2px 8px rgba(27, 42, 34, 0.04)`.
  - **Level 2 (Active/Selected Comparison Cards):** `#FFFFFF` surfaces with a 2px border in `#1F6B3A` or `#E0A526`, elevated with `box-shadow: 0 8px 24px rgba(31, 107, 58, 0.08)`.
  - **Level 3 (Modals, Bottom Sheets & Popovers):** Elevated `#FFFFFF` surfaces backed by a translucent scrim (`rgba(27, 42, 34, 0.4)`), lifted by `box-shadow: 0 12px 32px rgba(27, 42, 34, 0.12)`.
- **Atmospheric Overlays:** Glassmorphism is avoided on core functional controls to preserve crisp contrast ratios, reserved solely for non-critical map sensor layer controls over satellite views (`backdrop-filter: blur(8px)`, background `rgba(255, 255, 255, 0.85)`).

## Shapes
A balanced curvature framework (`roundedness: 2`, 12px–16px) evokes organic vitality without sacrificing space efficiency on compact screens:

- **Standard Containers & Cards:** `16px` (`rounded-lg`) corner radii to maintain friendly, modern surfaces.
- **Buttons, Inputs & Toggles:** `12px` base radius, offering structured tactile affordance.
- **Pills & Status Indicators:** Fully rounded (`9999px`) for badges, satellite sensor pills, and crop tags.
- **Data Tables & Scenario Grids:** Outer container `16px` with inner cell separations using clean 1px hairline dividers (`#E5E8DE`).

## Components

### 1. Primary & Secondary Buttons
- **Primary Action (e.g., "Calculer la rotation"):** Height minimum 48px, background `#1F6B3A`, text `#FFFFFF` (`body-bold`), border-radius 12px. Pressed state: `#164E2A`.
- **Secondary Action (e.g., "Modifier les paramètres du sol"):** Height 48px, background `transparent`, 1.5px solid border `#1F6B3A`, text `#1F6B3A`.
- **Recommendation Action:** Height 48px, background `#E0A526`, text `#1B2A22` (`body-bold`). Pressed state: `#B8851B`.

### 2. NASA Satellite Source Badges
- Explicit, color-coded identification pills denoting provenance without technical ambiguity:
  - Base container: Height 28px, padding 4px 10px, border-radius 9999px.
  - Background `#EBF2FA`, border 1px solid `rgba(30, 95, 168, 0.2)`.
  - Text: NASA Satellite Blue (`#1E5FA8`), `label-md` uppercase font.
  - Icon: Miniature satellite or radar wave glyph preceding text (e.g., `NASA SMAP • Humidité du sol`, `NASA IMERG • Précipitations`, `MODIS • Végétation`).

### 3. Scenario Comparison Cards (Crop Rotations)
- Border radius 16px, background `#FFFFFF`, padding 16px on mobile, 24px on desktop.
- Default Scenario: 1px border `#E5E8DE`.
- **"Scénario Recommandé" Card:** 2px border `#E0A526`, with a top-pinned gold ribbon badge (`#E0A526`, text `#1B2A22`, `label-lg`). Highlights estimated net margin in `FCFA/ha` and water balance scores.

### 4. Input Fields & Form Selectors
- Height 52px (optimized for thumbs in field conditions).
- Background `#FFFFFF`, 1.5px border `#D1D7C9`, radius 12px, text `#1B2A22` (`body-md`).
- Focus state: Border color `#1F6B3A`, outline 3px soft ring `rgba(31, 107, 58, 0.15)`.
- Helper text in `#5B6B62` (`caption`) with plain-language descriptions instead of technical variables (e.g., "Pluie attendue ce mois" instead of "Flux pluviométrique cumulé IMERG").

### 5. Checkboxes & Radio Selection
- Minimum box/circle dimension: 24px x 24px inside a 48px touch container.
- Active color: Deep green `#1F6B3A`. Inactive: 1.5px border `#5B6B62`.

### 6. Crop Rotation Timeline & Health Badges
- Timeline indicators using light green `#4CAF6A` for favorable planting windows, ochre `#E0A526` for harvest periods, and earth brown `#7A5230` for fallow or soil rest periods.
- High-contrast text labels showing projected yields formatted strictly as localized numbers followed by `FCFA` or `kg/ha`.
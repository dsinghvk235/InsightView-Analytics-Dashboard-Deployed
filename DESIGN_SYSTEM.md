# FinanceHub Analytics Dashboard - Design System
## Modern Light Theme | Premium SaaS Design

---

## A) Theme Philosophy

### Color Usage Strategy

**#003142 (Primary Dark)** - The Foundation
- Primary use: Typography, headings, strong contrast elements
- Key surfaces: Buttons, navigation active states, important UI elements
- Creates depth and hierarchy without heaviness
- Used at 100% opacity for primary text, 70-80% for secondary text

**#7FB3C8 (Accent Blue)** - The Energy
- Primary use: Interactive elements, highlights, active states
- Charts: Main accent color for all data visualizations
- Buttons: Accent button variant, hover states, focus rings
- Links: All hyperlinks and navigation indicators
- Status indicators: Active filters, selected items

**#E6F4F1 (Light Mint Background)** - The Canvas
- Primary use: Main application background
- Creates airy, modern, premium feel
- Slightly adjusted tints for card surfaces (white or very subtle mint)
- Provides breathing room and visual hierarchy

### Design Principles

1. **Minimal Color Palette**: Three colors used strategically, not decoratively
2. **High Contrast**: WCAG AA compliant for accessibility
3. **Layered Depth**: Subtle shadows and borders create hierarchy
4. **Premium Feel**: Clean, spacious, modern-gen aesthetic
5. **Consistent Spacing**: 8px grid system throughout
6. **Subtle Interactions**: Smooth transitions, hover states, focus rings

---

## B) Full Design Tokens

### Background Layers

```css
--bg-app: #E6F4F1;                    /* Main application background */
--bg-surface: #FFFFFF;                 /* Card surfaces (white) */
--bg-surface-subtle: #F0F9F7;          /* Subtle mint tint for elevated cards */
--bg-hover: #E6F4F1;                  /* Hover states */
--bg-active: #D1E8E3;                 /* Active/pressed states */
```

### Surface Colors

```css
--surface-base: #FFFFFF;               /* Primary card background */
--surface-raised: #F8FCFB;            /* Elevated cards (subtle mint) */
--surface-overlay: #FFFFFF;           /* Modals, dropdowns */
```

### Border Colors

```css
--border-subtle: #D1E8E3;             /* Very soft navy-tint border */
--border-default: #B8D9D1;            /* Standard borders */
--border-strong: #9FC4BB;              /* Stronger borders for emphasis */
--border-focus: #7FB3C8;              /* Focus rings (accent blue) */
```

### Typography Colors

```css
--text-primary: #003142;               /* Main text (100% opacity) */
--text-secondary: #003142;             /* Secondary text (70% opacity = #003142B3) */
--text-muted: #003142;                 /* Muted labels (50% opacity = #00314280) */
--text-placeholder: #003142;           /* Placeholder text (40% opacity = #00314266) */
--text-inverse: #FFFFFF;               /* Text on dark backgrounds */
```

### Button System

**Primary Button**
```css
--btn-primary-bg: #003142;
--btn-primary-text: #FFFFFF;
--btn-primary-hover: #001F2A;         /* Darker shade */
--btn-primary-active: #00151E;
```

**Secondary Button**
```css
--btn-secondary-bg: transparent;
--btn-secondary-border: #003142;
--btn-secondary-text: #003142;
--btn-secondary-hover-bg: #E6F4F1;
```

**Accent Button**
```css
--btn-accent-bg: #7FB3C8;
--btn-accent-text: #003142;
--btn-accent-hover: #6BA3B8;
--btn-accent-active: #5A93A8;
```

### Input System

```css
--input-bg: #FFFFFF;
--input-border: #B8D9D1;
--input-border-hover: #9FC4BB;
--input-border-focus: #7FB3C8;
--input-focus-ring: rgba(127, 179, 200, 0.2);  /* #7FB3C8 at 20% opacity */
--input-text: #003142;
--input-placeholder: #00314266;        /* 40% opacity */
```

### Card Style

```css
--card-radius: 16px;
--card-bg: #FFFFFF;
--card-border: #D1E8E3;
--card-shadow: 0 1px 3px rgba(0, 49, 66, 0.08);
--card-shadow-hover: 0 4px 12px rgba(0, 49, 66, 0.12);
```

### Status Colors (Derived from Palette)

**Success**
```css
--status-success: #059669;             /* Derived: teal-green that complements mint */
--status-success-bg: #D1FAE5;
--status-success-border: #6EE7B7;
```

**Pending**
```css
--status-pending: #D97706;            /* Derived: warm amber */
--status-pending-bg: #FEF3C7;
--status-pending-border: #FCD34D;
```

**Failed**
```css
--status-failed: #DC2626;             /* Derived: clear red */
--status-failed-bg: #FEE2E2;
--status-failed-border: #FCA5A5;
```

### Chips/Filters

```css
--chip-bg-default: #F0F9F7;
--chip-bg-active: #7FB3C8;
--chip-text-default: #003142;
--chip-text-active: #003142;
--chip-border: #D1E8E3;
```

### Focus Ring

```css
--focus-ring: 0 0 0 3px rgba(127, 179, 200, 0.2);
```

---

## C) Component Mapping

### Sidebar Navigation

**Background**: `#FFFFFF`
**Text (inactive)**: `#003142` at 60% opacity
**Text (active)**: `#003142` at 100%
**Active indicator**: `#7FB3C8` (left border + background tint)
**Hover background**: `#E6F4F1`
**Border**: `#D1E8E3` (right border)
**Logo background**: Gradient from `#003142` to `#7FB3C8`

### Top Header

**Background**: `rgba(255, 255, 255, 0.9)` with backdrop blur
**Border**: `#D1E8E3` (bottom)
**Text**: `#003142`
**Search input**: White background, `#B8D9D1` border, `#7FB3C8` focus ring
**Icons**: `#003142` at 60% opacity

### KPI Metric Cards

**Card background**: `#FFFFFF`
**Card border**: `#D1E8E3`
**Card shadow**: Subtle shadow
**Value text**: `#003142` (bold, large)
**Label text**: `#003142` at 60% opacity
**Icon background**: Gradient using `#7FB3C8` tints
**Trend badge**: Success/error colors derived from palette
**Hover**: Slight elevation, border color change to `#7FB3C8`

### Charts

**Chart background**: `#E6F4F1` (light mint)
**Chart area background**: `#FFFFFF` or `#F8FCFB`
**Main accent color**: `#7FB3C8`
**Axis labels**: `#003142` at 60% opacity
**Gridlines**: `#D1E8E3` (extremely subtle)
**Tooltip**: White card with `#003142` text, `#7FB3C8` indicator dot
**Line charts**: `#7FB3C8` stroke
**Bar charts**: `#7FB3C8` fill with gradient
**Pie charts**: `#7FB3C8` + tints for segments

### Tables

**Header background**: `#F0F9F7` (subtle mint)
**Header text**: `#003142` at 70% opacity (uppercase, small)
**Row background**: `#FFFFFF`
**Row hover**: `#E6F4F1`
**Border**: `#D1E8E3`
**Text**: `#003142`
**Status badges**: Derived status colors
**Pagination**: Standard button styles

### Modals/Dropdowns

**Background**: `#FFFFFF`
**Border**: `#D1E8E3`
**Shadow**: Elevated shadow
**Backdrop**: `rgba(0, 49, 66, 0.4)` with blur

### Tooltips

**Background**: `#FFFFFF`
**Border**: `#D1E8E3`
**Text**: `#003142`
**Accent dot**: `#7FB3C8`
**Shadow**: Subtle elevation

### Empty States

**Icon background**: `#F0F9F7`
**Icon color**: `#003142` at 40% opacity
**Text**: `#003142`
**Description**: `#003142` at 60% opacity

### Skeleton Loaders

**Background**: `#E6F4F1`
**Shimmer**: `#D1E8E3` to `#F0F9F7`

---

## D) 15 UI Rules for Consistent Modern Look

1. **Background Rule**: Always use `#E6F4F1` as the main app background. Cards use white (`#FFFFFF`) or very subtle mint (`#F8FCFB`).

2. **Typography Rule**: All text uses `#003142`. Adjust opacity only: 100% for primary, 70% for secondary, 50% for muted, 40% for placeholders.

3. **Accent Rule**: `#7FB3C8` is ONLY used for interactive elements: buttons, links, focus rings, chart accents, active states. Never for static text.

4. **Border Rule**: Use `#D1E8E3` for subtle borders, `#B8D9D1` for standard borders. Never use harsh black borders.

5. **Shadow Rule**: All shadows use `rgba(0, 49, 66, ...)` with low opacity (0.04-0.12). Never pure black shadows.

6. **Card Rule**: All cards have 16px border radius, white background, subtle border, minimal shadow. Hover elevates slightly.

7. **Button Rule**: Primary buttons use `#003142` background with white text. Accent buttons use `#7FB3C8` background with `#003142` text.

8. **Input Rule**: White background, `#B8D9D1` border, `#7FB3C8` focus ring (3px, 20% opacity). Placeholder text at 40% opacity.

9. **Chart Rule**: Chart backgrounds use `#E6F4F1`. All data visualizations use `#7FB3C8` as primary color. Gridlines extremely subtle.

10. **Status Rule**: Success/Pending/Failed use derived colors that complement the palette. Never introduce neon colors.

11. **Spacing Rule**: Use 8px grid system. Cards have 16-24px padding. Sections have 20-24px gaps.

12. **Hover Rule**: All interactive elements have hover states. Backgrounds shift to `#E6F4F1` or `#F0F9F7`. Borders may shift to `#7FB3C8`.

13. **Focus Rule**: All focusable elements show `#7FB3C8` focus ring (3px, 20% opacity). Keyboard navigation must be clear.

14. **Empty State Rule**: Empty states use `#F0F9F7` icon backgrounds, `#003142` text at reduced opacity. Keep minimal and helpful.

15. **Animation Rule**: All transitions use 150-200ms duration with ease-out timing. Hover effects are subtle, not jarring.

---

## E) Example UI Screenshots Description

### Dashboard Overview
- **Feel**: Airy, spacious, premium SaaS dashboard
- **Background**: Soft mint (`#E6F4F1`) creates breathing room
- **Cards**: White cards float on mint background with subtle shadows
- **Typography**: Dark navy (`#003142`) provides excellent readability
- **Accents**: `#7FB3C8` appears sparingly in charts and interactive elements
- **Overall**: Clean, modern, professional - like Stripe or Linear dashboards

### Charts Page
- **Chart Background**: Light mint (`#E6F4F1`) behind chart areas
- **Data Visualization**: `#7FB3C8` as primary chart color creates visual interest
- **Gridlines**: Barely visible, extremely subtle
- **Tooltips**: White cards with `#003142` text and `#7FB3C8` accent dots
- **Feel**: Data-focused, clear, premium

### Transaction Table
- **Table Header**: Subtle mint background (`#F0F9F7`)
- **Rows**: White with mint hover (`#E6F4F1`)
- **Borders**: Soft navy-tint borders (`#D1E8E3`)
- **Status Badges**: Derived colors that feel cohesive
- **Feel**: Clean, scannable, professional

### Sidebar Navigation
- **Background**: Pure white (`#FFFFFF`)
- **Active Item**: `#7FB3C8` left border + subtle background tint
- **Text**: `#003142` with opacity variations
- **Hover**: Subtle mint background (`#E6F4F1`)
- **Feel**: Minimal, focused, premium

---

## Implementation Notes

- All colors derived from the three-color palette
- Status colors (success/pending/failed) are carefully chosen to complement the palette
- No neon colors or harsh contrasts
- WCAG AA compliant contrast ratios maintained
- Consistent 8px spacing grid throughout
- 16px border radius for all cards
- Subtle shadows and borders create depth without heaviness

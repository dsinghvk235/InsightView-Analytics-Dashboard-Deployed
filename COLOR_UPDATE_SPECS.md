# Color Palette Update - Status Charts
## FinanceHub Analytics Dashboard

---

## Updated Color Mapping

### Theme Colors (UI Elements)
- **Background**: `#E6F4F1` (Light Mint)
- **Text Primary**: `#003142` (Primary Navy)
- **Text Secondary**: `rgba(0, 49, 66, 0.6)` (Primary Navy at 60% opacity)
- **Text Muted**: `rgba(0, 49, 66, 0.5)` (Primary Navy at 50% opacity)
- **Borders/Gridlines**: `rgba(0, 49, 66, 0.1)` (Primary Navy at 10% opacity)
- **Accent (Toggles/Active)**: `#7FB3C8` (Accent Blue)

### Semantic Status Colors (Chart Data Only)
- **Success**: 
  - Fill: `#2E9C7A`
  - Background: `rgba(46, 156, 122, 0.14)`
  - Border: `rgba(46, 156, 122, 0.35)`
  - Glow: `rgba(46, 156, 122, 0.4)`

- **Pending**: 
  - Fill: `#D6A13A`
  - Background: `rgba(214, 161, 58, 0.16)`
  - Border: `rgba(214, 161, 58, 0.35)`
  - Glow: `rgba(214, 161, 58, 0.4)`

- **Failed**: 
  - Fill: `#D65A5A`
  - Background: `rgba(214, 90, 90, 0.14)`
  - Border: `rgba(214, 90, 90, 0.35)`
  - Glow: `rgba(214, 90, 90, 0.4)`

---

## Component 1: "Status Split Over Time" Stacked Bar Chart

### Location
`AdvancedCharts.tsx` - Lines ~1872-2196

### Updates Applied

#### 1. Status Colors Constant
- Updated `STATUS_COLORS` object with new semantic colors
- Added `border` property to each status color config

#### 2. View Mode Toggle
- **Background**: `#F0F9F7` (subtle mint)
- **Border**: `rgba(0, 49, 66, 0.1)` (theme border)
- **Active Button**: White background with `rgba(0, 49, 66, 0.1)` border
- **Text**: `#003142` (active) / `rgba(0, 49, 66, 0.6)` (inactive)
- **Shadow**: `rgba(0, 49, 66, 0.05)` for active state

#### 3. Legend Chips (Redesigned)
- **Background**: `#ffffff` (white surface)
- **Border**: 
  - Active: Semantic border color (`rgba(46, 156, 122, 0.35)` for success, etc.)
  - Inactive: `rgba(0, 49, 66, 0.1)` (theme border)
- **Text**: `#003142` (active) / `rgba(0, 49, 66, 0.6)` (inactive)
- **Dot**: 
  - 8px circular dot with semantic fill color
  - Active: Subtle glow shadow using semantic light color
- **Hover State**: 
  - Background shifts to `#F0F9F7`
  - Border color intensifies to `rgba(0, 49, 66, 0.15)`

#### 4. Chart Gridlines & Axes
- **Gridlines**: `rgba(0, 49, 66, 0.1)` (Primary Navy at 10% opacity)
- **X-Axis**: 
  - Stroke: `rgba(0, 49, 66, 0.1)`
  - Tick text: `rgba(0, 49, 66, 0.5)`
  - Axis line: `rgba(0, 49, 66, 0.1)`
- **Y-Axis**: 
  - Stroke: `rgba(0, 49, 66, 0.1)`
  - Tick text: `rgba(0, 49, 66, 0.6)`
  - Label text: `rgba(0, 49, 66, 0.6)`

#### 5. Stacked Bars
- **Success Bar**: `#2E9C7A` fill
- **Pending Bar**: `#D6A13A` fill
- **Failed Bar**: `#D65A5A` fill
- **Separator**: White stroke (`#ffffff`) with 2px width
- **Radius**: Top corners rounded (8px) for failed, bottom corners (8px) for success

#### 6. Tooltip
- **Background**: `rgba(255, 255, 255, 0.98)` with blur
- **Border**: `rgba(0, 49, 66, 0.1)` (theme border)
- **Text**: `#003142` (primary) / `rgba(0, 49, 66, 0.6)` (secondary)
- **Status Dots**: Circular (50% border-radius) with semantic colors
- **Dividers**: `rgba(0, 49, 66, 0.1)`

#### 7. Cursor
- **Fill**: `rgba(0, 49, 66, 0.05)` (very subtle)
- **Stroke**: `rgba(0, 49, 66, 0.1)` (theme border)

---

## Component 2: "Transaction Status" Progress Chart

### Location
`Charts.tsx` - Lines ~1241-1590

### Updates Applied

#### 1. Status Colors Constant
- Updated `STATUS_COLORS` object with new semantic colors
- Added `border` property to each status color config

#### 2. Metric Toggle (Count/Amount)
- **Background**: `#F0F9F7` (subtle mint)
- **Border**: `rgba(0, 49, 66, 0.1)` (theme border)
- **Active Button**: White background with `rgba(0, 49, 66, 0.1)` border
- **Text**: `#003142` (active) / `rgba(0, 49, 66, 0.6)` (inactive)
- **Shadow**: `rgba(0, 49, 66, 0.05)` for active state

#### 3. Status Bars (Progress Bars)
- **Track Background**: 
  - Default: `#E6F4F1` (light mint)
  - Active/Hover: Semantic light color (`rgba(46, 156, 122, 0.14)` etc.)
- **Track Border**: 
  - Default: `rgba(0, 49, 66, 0.1)` (theme border)
  - Active: Semantic border color (`rgba(46, 156, 122, 0.35)` etc.)
- **Bar Fill**: 
  - Default: Semantic main color (`#2E9C7A`, `#D6A13A`, `#D65A5A`)
  - Active/Hover: Semantic gradient
- **Bar Shadow**: 
  - Default: `rgba(0, 49, 66, 0.06)`
  - Active: Semantic glow (`rgba(46, 156, 122, 0.4)` etc.)

#### 4. Status Label Dots
- **Shape**: Circular (50% border-radius)
- **Color**: Semantic main color
- **Size**: 8px × 8px
- **Glow**: Active state shows semantic glow shadow

#### 5. Status Labels
- **Text Color**: `rgba(0, 49, 66, 0.7)` (theme text)
- **Font Weight**: 600

#### 6. Value Display
- **Primary Value**: `#003142` (theme primary)
- **Percentage**: Semantic main color
- **Font**: Tabular nums for alignment

#### 7. Total Summary Bar
- **Border Top**: `rgba(0, 49, 66, 0.1)` (theme border)
- **Label Text**: `rgba(0, 49, 66, 0.6)` (theme secondary)
- **Value Text**: `#003142` (theme primary)

#### 8. Hover States
- **Row Opacity**: Inactive rows fade to 50% opacity
- **Track Background**: Shifts to semantic light color
- **Track Border**: Intensifies to semantic border color
- **Bar**: Scales to 108% height, shows gradient, enhanced glow

---

## Visual Specifications

### Legend Chip Design
```
┌─────────────────────────┐
│  ●  Success             │  ← White background
│                         │  ← Theme border (rgba(0, 49, 66, 0.1))
│                         │  ← Semantic dot (#2E9C7A)
│                         │  ← Theme text (#003142)
└─────────────────────────┘

Active State:
┌─────────────────────────┐
│  ●  Success             │  ← White background
│                         │  ← Semantic border (rgba(46, 156, 122, 0.35))
│                         │  ← Semantic dot with glow
│                         │  ← Theme text (#003142)
│                         │  ← Subtle shadow ring (semantic light color)
└─────────────────────────┘
```

### Gridline Styling
- **Color**: `rgba(0, 49, 66, 0.1)` (Primary Navy at 10% opacity)
- **Style**: Dashed (2px dash, 4px gap)
- **Width**: 0.8px
- **Opacity**: 100% (color already has opacity)

### Axis Styling
- **Stroke**: `rgba(0, 49, 66, 0.1)` (Primary Navy at 10% opacity)
- **Tick Text**: `rgba(0, 49, 66, 0.5)` (Primary Navy at 50% opacity)
- **Label Text**: `rgba(0, 49, 66, 0.6)` (Primary Navy at 60% opacity)
- **Tick Line**: Hidden (false)
- **Axis Line**: Very subtle (10% opacity)

### Bar Hover States
- **Scale**: `scaleY(1.08)` (8% vertical increase)
- **Shadow**: Enhanced glow using semantic color
- **Gradient**: Active bars show gradient instead of solid fill
- **Track**: Background shifts to semantic light color
- **Border**: Intensifies to semantic border color

---

## Implementation Summary

### Files Modified
1. `Charts.tsx` - Transaction Status component
2. `AdvancedCharts.tsx` - Status Split Over Time component

### Key Changes
- ✅ Updated STATUS_COLORS constants with new semantic colors
- ✅ Redesigned legend chips (white surface + theme border + semantic dot)
- ✅ Updated gridlines to use theme color at 10% opacity
- ✅ Updated axis styling to use theme colors
- ✅ Updated toggle buttons with theme colors
- ✅ Updated tooltips with theme borders and text colors
- ✅ Updated hover/active states for bars and chips
- ✅ Changed status dots from square to circular
- ✅ Updated all shadows to use theme color opacity

### Color Consistency
- All UI surfaces use theme colors (#003142, #7FB3C8, #E6F4F1)
- All semantic indicators use semantic colors (#2E9C7A, #D6A13A, #D65A5A)
- Borders and gridlines use rgba(0, 49, 66, 0.1) for premium subtlety
- Text uses #003142 with opacity variations for hierarchy

---

## Testing Checklist

- [ ] Status Split Over Time chart displays with new colors
- [ ] Transaction Status chart displays with new colors
- [ ] Legend chips show white background with theme borders
- [ ] Semantic dots are circular and use correct colors
- [ ] Toggle buttons use theme colors
- [ ] Gridlines are subtle (10% opacity)
- [ ] Axes use theme colors
- [ ] Hover states work correctly
- [ ] Active states show semantic borders and glows
- [ ] Tooltips use theme colors
- [ ] All text is readable (WCAG compliant)

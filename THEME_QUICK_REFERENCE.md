# Theme System Quick Reference

## Using CSS Variables

### Backgrounds
```tsx
backgroundColor: 'var(--bg-page)'        // Main page background
backgroundColor: 'var(--bg-subtle)'      // Subtle background
backgroundColor: 'var(--surface-base)'   // Card/surface background
backgroundColor: 'var(--surface-raised)' // Elevated surface
```

### Text Colors
```tsx
color: 'var(--text-primary)'      // Primary text
color: 'var(--text-secondary)'    // Secondary text
color: 'var(--text-tertiary)'     // Tertiary text
color: 'var(--text-muted)'        // Muted text
color: 'var(--text-placeholder)'  // Placeholder text
color: 'var(--text-link)'         // Link color
```

### Borders
```tsx
border: '1px solid var(--border-subtle)'  // Subtle border
border: '1px solid var(--border-default)' // Default border
border: '1px solid var(--border-strong)'  // Strong border
border: '1px solid var(--border-focus)'   // Focus border
```

### Accent Colors
```tsx
backgroundColor: 'var(--accent-blue)'      // Accent blue
backgroundColor: 'var(--accent-indigo)'   // Deep navy (light) / Accent blue (dark)
color: 'var(--accent-blue)'               // Accent text
```

### Semantic Colors
```tsx
color: 'var(--success)'           // Success green
color: 'var(--warning)'           // Warning amber
color: 'var(--error)'             // Error red
backgroundColor: 'var(--success-light)'  // Success background
```

### Shadows
```tsx
boxShadow: 'var(--shadow-xs)'      // Extra small shadow
boxShadow: 'var(--shadow-sm)'      // Small shadow
boxShadow: 'var(--shadow-md)'      // Medium shadow
boxShadow: 'var(--shadow-lg)'      // Large shadow
boxShadow: 'var(--shadow-card)'    // Card shadow
boxShadow: 'var(--shadow-card-hover)' // Card hover shadow
```

## Theme Context Usage

```tsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark' (actual applied theme)
  
  return (
    <div>
      Current theme: {resolvedTheme}
      <button onClick={() => setTheme('dark')}>Dark</button>
    </div>
  );
};
```

## Common Patterns

### Conditional Styling (Use Sparingly)
```tsx
const { resolvedTheme } = useTheme();
const isDark = resolvedTheme === 'dark';

// Prefer CSS variables instead
```

### Theme-Aware Components
```tsx
<div style={{
  backgroundColor: 'var(--surface-base)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-card)'
}}>
  Content
</div>
```

## Migration Checklist

- [ ] Replace `#E6F4F1` → `var(--bg-page)`
- [ ] Replace `#003142` → `var(--text-primary)` or `var(--accent-indigo)`
- [ ] Replace `#7FB3C8` → `var(--accent-blue)`
- [ ] Replace `#ffffff` → `var(--surface-base)`
- [ ] Replace `rgba(0, 49, 66, X)` → `var(--text-secondary)` etc.
- [ ] Replace hardcoded shadows → `var(--shadow-*)`
- [ ] Replace border colors → `var(--border-*)`

## Testing

1. Toggle between light/dark/system modes
2. Verify all components adapt correctly
3. Check contrast ratios meet WCAG AA
4. Test focus indicators are visible
5. Verify charts remain readable
6. Check tables and forms are accessible

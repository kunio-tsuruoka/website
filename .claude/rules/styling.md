# Styling Rules

## Tailwind CSS

### Brand Colors

```html
<!-- Primary: Beekle Purple -->
<div class="bg-primary-500 text-primary-foreground">
<div class="text-primary-500">

<!-- Accent: Dark Navy -->
<div class="bg-accent-950 text-white">
<div class="text-navy-950">

<!-- Secondary: Cyan -->
<div class="bg-secondary-500 text-white">
<div class="text-secondary-500">

<!-- Highlight: Yellow -->
<div class="bg-highlight-500">
```

### Typography

```html
<!-- 見出し -->
<h1 class="font-Poppins text-5xl font-bold">
<h2 class="font-Montserrat text-4xl font-bold">

<!-- 本文（日本語） -->
<p class="font-NotoSansJP text-base">
```

### Shadows

```html
<div class="shadow-soft">   <!-- 軽い影 -->
<div class="shadow-medium"> <!-- 中程度 -->
<div class="shadow-strong"> <!-- 強い影 -->
```

### Border Radius

```html
<div class="rounded-2xl"> <!-- 32px -->
<div class="rounded-3xl"> <!-- 40px -->
```

## cn() Utility

```typescript
import { cn } from '@/lib/utils';

// クラス結合（条件付き）
cn('base-class', isActive && 'active-class', className)

// 衝突解決（tailwind-merge）
cn('p-4', 'p-8') // → 'p-8'
```

## CSS Variables

定義: `src/theme.json`

```css
/* 使用例 */
background: hsl(var(--primary));
color: hsl(var(--foreground));
```

## Responsive

```html
<!-- モバイルファースト -->
<div class="py-16 md:py-20 lg:py-24">
<div class="text-2xl md:text-3xl lg:text-4xl">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

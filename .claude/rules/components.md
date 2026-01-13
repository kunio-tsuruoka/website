# Component Rules

## UI Components (src/components/ui/)

共通UIコンポーネントは `@/components/ui/` から import

```typescript
import { Button, Card, Section, SectionHeader } from '@/components/ui';
```

## Section Component

```tsx
<Section variant="white" padding="lg" decoration="blursPurple">
  <SectionHeader
    title="タイトル"
    subtitle="サブタイトル"
    number="01"
    label="SERVICE"
  />
  {/* コンテンツ */}
</Section>
```

### Section Variants
- `white` - 白背景（デフォルト）
- `light` - ライトグレー
- `lightPurple` - 薄いパープルグラデーション
- `lightCyan` - 薄いシアングラデーション
- `navy` - ダークネイビー（白文字）
- `primary` - Beekle Purple（白文字）

### Decorations
- `blursPurple` - パープルぼかし
- `blursCyan` - シアンぼかし
- `bars` - 斜めバー
- `dots` - ドット装飾
- `none` - 装飾なし

## React Component Pattern

```tsx
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  // ...
}

export function MyComponent({ className, ...props }: Props) {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {/* ... */}
    </div>
  );
}
```

## Animation (Framer Motion)

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
```

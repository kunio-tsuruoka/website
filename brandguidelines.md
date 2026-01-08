# Beekle Brand Guidelines - Pop Style

インフルエンサーマッチングプラットフォーム デザインシステム

---

## 1. デザイン哲学

| No. | Principle | Description |
|-----|-----------|-------------|
| 01 | **Professional & Vibrant** | 信頼感のあるダークネイビーと華やかなアクセントカラーの組み合わせ |
| 02 | **Playful Decorations** | カラフルな装飾要素（斜めバー、ドット）で躍動感を演出 |
| 03 | **Clean Cards** | 白背景のカードで情報を整理、大きな角丸でソフトな印象 |
| 04 | **Bold Typography** | 大きな見出しと番号で視認性を確保 |

---

## 2. カラーパレット

### Primary - Beekle Purple (Logo Color)
ブランドアイデンティティ・信頼・プロフェッショナル

| Shade | Hex | HSL | Usage |
|-------|-----|-----|-------|
| 50 | `#eef0ff` | `233 100% 97%` | 薄い背景 |
| 100 | `#dde3ff` | `233 100% 93%` | ホバー背景 |
| 300 | `#a0b0ff` | `233 100% 81%` | アクセント薄め |
| **500** | **`#3D4DB7`** | `233 50% 48%` | **メインカラー（ロゴ色）** |
| 600 | `#3342a0` | `233 50% 42%` | ホバー状態 |
| 700 | `#2a378a` | `233 50% 35%` | 強調 |

### Accent - Dark Navy
プロフェッショナル・コントラスト

| Shade | Hex | HSL | Usage |
|-------|-----|-----|-------|
| 50 | `#e6eaf0` | `220 30% 92%` | 薄い背景 |
| 100 | `#c0c9d9` | `220 30% 80%` | ボーダー |
| 500 | `#2d4b80` | `220 47% 34%` | 通常テキスト |
| 800 | `#183263` | `220 60% 24%` | 強調 |
| **950** | **`#001738`** | `220 100% 11%` | **アクセント** |

### Secondary - Vivid Cyan
活気・クリエイティブ

| Shade | Hex | HSL | Usage |
|-------|-----|-----|-------|
| 50 | `#e0f7fa` | `185 70% 93%` | 薄い背景 |
| 400 | `#26c6da` | `185 75% 50%` | アイコン |
| **500** | **`#00c4cc`** | `183 100% 40%` | **セカンダリカラー** |
| 600 | `#00b4b8` | `183 100% 36%` | ホバー |

### Highlight - Yellow
注目・ポイント

| Shade | Hex | HSL | Usage |
|-------|-----|-----|-------|
| 100 | `#fff9c4` | `55 100% 88%` | 薄い背景 |
| **500** | **`#ffd600`** | `50 100% 50%` | **ハイライト** |
| 600 | `#ffc400` | `46 100% 50%` | ホバー |

### Neutral
| Shade | Hex | Usage |
|-------|-----|-------|
| 0 | `#ffffff` | 背景 |
| 50 | `#f5f8fa` | セクション背景 |
| 100 | `#eef2f5` | カード背景 |
| 600 | `#5c6d7d` | サブテキスト |
| 900 | `#1a2632` | 本文 |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#00c853` | 成功・完了 |
| Warning | `#ffc107` | 警告・注意 |
| Danger | `#ff3d00` | エラー・削除 |
| Info | `#2196f3` | 情報 |

---

## 3. 装飾要素 (Pop Decorations)

### 斜めバー (Diagonal Bars)
画面の端やセクション背景に配置して動きを出す

```css
/* Beekle Purple Bar */
.decoration-bar-purple {
  background: linear-gradient(135deg, #3D4DB7, #a0b0ff);
  border-radius: 9999px;
  transform: rotate(-25deg);
}

/* Cyan Bar */
.decoration-bar-cyan {
  background: linear-gradient(135deg, #00c4cc, #26c6da);
  border-radius: 9999px;
  transform: rotate(25deg);
}

/* Yellow Bar */
.decoration-bar-yellow {
  background: linear-gradient(135deg, #ffd600, #fff176);
  border-radius: 9999px;
  transform: rotate(-15deg);
}
```

### ドット (Dots)
アクセントとして配置

```css
.decoration-dot {
  border-radius: 50%;
  /* サイズ: 4px ~ 24px */
}

/* 使用カラー */
.dot-purple { background: #3D4DB7; }
.dot-cyan { background: #00c4cc; }
.dot-yellow { background: #ffd600; }
```

### 配置ルール
- ヘッダー右側に斜めバーを3本程度配置
- ドットはバーの周囲や空白部分に散らす
- 過剰にならないよう1セクション5-8個まで

---

## 4. タイポグラフィ

### フォントファミリー

| Purpose | Font | Weight |
|---------|------|--------|
| Display/見出し | Montserrat, Poppins | 700-800 (Bold/ExtraBold) |
| 日本語 | Noto Sans JP | 500-700 |
| 数字・アクセント | Lato | 700 |

### 見出しスケール

```css
/* Hero */
.hero-title {
  font-size: 3.75rem; /* 60px */
  font-weight: 800;
  line-height: 1.1;
}

/* H1 */
.h1 {
  font-size: 3rem; /* 48px */
  font-weight: 700;
}

/* H2 */
.h2 {
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
}

/* Section Label (Small) */
.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #3D4DB7; /* Beekle Purple */
}
```

### 数字ラベル
セクションを区切る大きな番号

```css
.number-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem; /* 48px */
  font-weight: 700;
  color: #3D4DB7; /* Beekle Purple */
}
```

---

## 5. コンポーネント

### ボタン

#### Primary Button (Beekle Purple)
```css
.btn-primary {
  background: #3D4DB7;
  color: white;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
}
.btn-primary:hover {
  background: #3342a0;
}
```

#### Accent Button (Dark Navy)
```css
.btn-accent {
  background: #001738;
  color: white;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
}
.btn-accent:hover {
  background: #183263;
}
```

#### Secondary Button (Cyan)
```css
.btn-secondary {
  background: #00c4cc;
  color: white;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
}
```

#### Outline Buttons
```css
.btn-outline {
  background: transparent;
  border: 2px solid currentColor;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
}
```

### カード

#### Feature Card
```css
.card-feature {
  background: white;
  border-radius: 1.5rem; /* 24px */
  padding: 2rem;
  box-shadow: 0 4px 20px -4px rgba(0, 23, 56, 0.08);
}
```

#### Highlight Card (背景色あり)
```css
.card-highlight {
  background: #00c4cc; /* or #9333ea */
  color: white;
  border-radius: 1.5rem;
  padding: 2rem;
}
```

### バッジ/タグ

```css
/* Light Background */
.badge-purple-light {
  background: #eef0ff;
  color: #3342a0;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Solid Background */
.badge-purple-solid {
  background: #3D4DB7;
  color: white;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}
```

---

## 6. シャドウ

| Name | Value | Usage |
|------|-------|-------|
| soft | `0 4px 20px -4px rgba(0, 23, 56, 0.08)` | カード |
| medium | `0 8px 30px -8px rgba(0, 23, 56, 0.12)` | ホバー |
| strong | `0 16px 50px -12px rgba(0, 23, 56, 0.18)` | モーダル |

---

## 7. 角丸 (Border Radius)

| Size | Value | Usage |
|------|-------|-------|
| full | `9999px` | ボタン、バッジ |
| 3xl | `40px` | 大きなセクション |
| 2xl | `32px` | カード |
| xl | `24px` | 小さいカード |

---

## 8. アニメーション

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}
```

---

## 9. 使用ガイド

### DO (推奨)
- ダークネイビー(#001738)とパープル(#9333ea)のコントラストを活かす
- 装飾要素（斜めバー、ドット）で画面に動きを出す
- 白背景のカードで情報を整理
- 大きな番号（01, 02, 03...）でセクションを区切る
- 角丸を大きめに取って柔らかい印象に
- ボタンは完全な角丸（rounded-full）

### DON'T (避ける)
- 装飾要素を過剰に配置しない（1セクション5-8個まで）
- パープルを本文テキストに使わない（見出し・アクセントのみ）
- カードに強いシャドウをかけない（soft shadowを使用）
- 複雑なグラデーションを多用しない
- 小さすぎるボタン・タップターゲット（最小44px）

---

## 10. Tailwind CSS 設定

```javascript
// tailwind.config.mjs に追加
theme: {
  extend: {
    colors: {
      // Primary - Beekle Purple (Logo Color)
      primary: {
        50: '#eef0ff',
        100: '#dde3ff',
        300: '#a0b0ff',
        500: '#3D4DB7',
        600: '#3342a0',
        700: '#2a378a',
      },
      // Accent - Dark Navy
      accent: {
        50: '#e6eaf0',
        100: '#c0c9d9',
        500: '#2d4b80',
        800: '#183263',
        950: '#001738',
      },
      // Secondary - Cyan
      secondary: {
        50: '#e0f7fa',
        400: '#26c6da',
        500: '#00c4cc',
        600: '#00b4b8',
      },
      // Highlight - Yellow
      highlight: {
        100: '#fff9c4',
        500: '#ffd600',
        600: '#ffc400',
      },
    },
    borderRadius: {
      '2xl': '32px',
      '3xl': '40px',
    },
    boxShadow: {
      'soft': '0 4px 20px -4px rgba(0, 23, 56, 0.08)',
      'medium': '0 8px 30px -8px rgba(0, 23, 56, 0.12)',
    },
    animation: {
      'fade-in-up': 'fadeInUp 0.5s ease-out',
      'float': 'float 3s ease-in-out infinite',
    },
  },
}
```

---

## 11. カラー対比表

| Foreground | Background | Contrast | WCAG |
|------------|------------|----------|------|
| White | #001738 (Navy) | 16.7:1 | AAA |
| White | #3D4DB7 (Purple) | 5.8:1 | AA |
| White | #00c4cc (Cyan) | 3.1:1 | AA Large |
| #001738 | White | 16.7:1 | AAA |
| #3D4DB7 | #eef0ff | 6.5:1 | AA |

---

*Beekle Pop Style Design System v1.0*

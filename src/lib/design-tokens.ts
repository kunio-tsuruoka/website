/**
 * Beekle Design System - デザイントークン
 *
 * ブランドガイドライン Pop Style に基づいた統一デザインシステム
 * 全ページ・コンポーネントでこれらの定数を使用する
 *
 * カラーパレット:
 * - Primary: Dark Navy (#001738)
 * - Accent: Beets Purple (#9333ea)
 * - Secondary: Vivid Cyan (#00c4cc)
 * - Highlight: Yellow (#ffd600)
 */

// ===========================
// ブランドカラー（Hex）
// ===========================
export const brandColors = {
  // Primary - Dark Navy
  navy: {
    50: '#e6eaf0',
    100: '#c0c9d9',
    500: '#2d4b80',
    800: '#183263',
    950: '#001738',
  },
  // Accent - Beets Purple
  purple: {
    50: '#f5f0ff',
    100: '#ece0ff',
    300: '#c9a0ff',
    600: '#9333ea',
    700: '#7e22ce',
  },
  // Secondary - Vivid Cyan
  cyan: {
    50: '#e0f7fa',
    400: '#26c6da',
    500: '#00c4cc',
    600: '#00b4b8',
  },
  // Highlight - Yellow
  yellow: {
    100: '#fff9c4',
    500: '#ffd600',
    600: '#ffc400',
  },
  // Neutral
  neutral: {
    0: '#ffffff',
    50: '#f5f8fa',
    100: '#eef2f5',
    600: '#5c6d7d',
    900: '#1a2632',
  },
} as const;

// ===========================
// グラデーション
// ===========================
export const gradients = {
  // プライマリ（CTAボタン、強調セクション背景）
  primary: 'from-navy-950 to-navy-800',
  primaryHover: 'from-navy-800 to-navy-500',

  // アクセント（パープル）
  accent: 'from-accent-600 to-accent-700',
  accentLight: 'from-accent-300 to-accent-600',

  // セカンダリ（シアン）
  secondary: 'from-secondary-500 to-secondary-600',

  // 装飾バー用
  barPurple: 'from-accent-600 to-accent-300',
  barCyan: 'from-secondary-500 to-secondary-400',
  barYellow: 'from-highlight-500 to-yellow-200',

  // 背景用（ライト）
  lightGray: 'from-neutral-50 to-white',
  lightPurple: 'from-accent-50 to-white',
  lightCyan: 'from-secondary-50 to-white',

  // テキストグラデーション
  textAccent: 'from-accent-600 to-accent-700',
} as const;

// ===========================
// Tailwind クラス用カラー
// ===========================
export const colors = {
  // テキスト
  text: {
    heading: 'text-neutral-900',
    body: 'text-neutral-900',
    muted: 'text-neutral-600',
    light: 'text-white',
    lightMuted: 'text-white/90',
    accent: 'text-accent-600',
    accentHover: 'hover:text-accent-700',
    navy: 'text-navy-950',
    cyan: 'text-secondary-500',
  },

  // 背景
  bg: {
    white: 'bg-white',
    light: 'bg-neutral-50',
    section: 'bg-neutral-100',
    navy: 'bg-navy-950',
    navyHover: 'hover:bg-navy-800',
    accent: 'bg-accent-600',
    accentHover: 'hover:bg-accent-700',
    accentLight: 'bg-accent-50',
    secondary: 'bg-secondary-500',
    secondaryHover: 'hover:bg-secondary-600',
    secondaryLight: 'bg-secondary-50',
    highlight: 'bg-highlight-500',
    highlightLight: 'bg-highlight-100',
  },

  // アイコン
  icon: {
    navy: 'text-navy-950',
    purple: 'text-accent-600',
    cyan: 'text-secondary-500',
    yellow: 'text-highlight-500',
  },

  // ボーダー
  border: {
    light: 'border-neutral-100',
    default: 'border-neutral-200',
    navy: 'border-navy-950',
    accent: 'border-accent-600',
    white: 'border-white',
  },
} as const;

// ===========================
// スペーシング
// ===========================
export const spacing = {
  // セクション
  section: {
    sm: 'py-16 md:py-20',
    md: 'py-20 md:py-24',
    lg: 'py-24 md:py-32',
  },

  // コンテナ
  container: {
    default: 'px-4 sm:px-6 lg:px-8',
    wide: 'px-8 lg:px-12',
  },

  // カード
  card: {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-10 md:p-12',
  },

  // グリッドギャップ
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },

  // マージン
  mb: {
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
    xl: 'mb-12',
    '2xl': 'mb-16',
  },
} as const;

// ===========================
// タイポグラフィ
// ===========================
export const typography = {
  // 見出し（Montserrat / Poppins）
  heading: {
    hero: 'text-5xl md:text-6xl lg:text-7xl font-extrabold',
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl font-bold',
    h4: 'text-xl md:text-2xl font-bold',
  },

  // セクションラベル
  sectionLabel: 'text-sm font-semibold tracking-wide text-accent-600 uppercase',

  // 数字ラベル
  numberLabel: 'font-Poppins text-5xl font-bold text-accent-600',

  // 本文
  body: {
    lg: 'text-lg md:text-xl leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed',
    sm: 'text-sm md:text-base leading-relaxed',
  },
} as const;

// ===========================
// ボーダー半径（ブランドガイドライン準拠）
// ===========================
export const radius = {
  full: 'rounded-full', // ボタン、バッジ
  '3xl': 'rounded-[40px]', // 大きなセクション
  '2xl': 'rounded-[32px]', // カード
  xl: 'rounded-[24px]', // 小さいカード
  lg: 'rounded-lg',
} as const;

// ===========================
// シャドウ（ブランドガイドライン準拠）
// ===========================
export const shadows = {
  soft: 'shadow-soft', // カード: 0 4px 20px -4px rgba(0, 23, 56, 0.08)
  medium: 'shadow-medium', // ホバー: 0 8px 30px -8px rgba(0, 23, 56, 0.12)
  strong: 'shadow-strong', // モーダル: 0 16px 50px -12px rgba(0, 23, 56, 0.18)
  // Tailwindデフォルト
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  // ホバー時
  hoverMedium: 'hover:shadow-medium',
  hoverXl: 'hover:shadow-xl',
} as const;

// ===========================
// トランジション
// ===========================
export const transitions = {
  default: 'transition-all',
  colors: 'transition-colors',
  shadow: 'transition-shadow',
  transform: 'transition-transform',
  // 期間
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
} as const;

// ===========================
// ホバーエフェクト
// ===========================
export const hover = {
  lift: 'hover:-translate-y-1 transform transition-transform',
  scale: 'hover:scale-105 transition-transform',
  shadow: 'hover:shadow-medium transition-shadow',
  opacity: 'hover:opacity-80 transition-opacity',
} as const;

// ===========================
// 装飾要素（Pop Decorations）
// ===========================
export const decorations = {
  // 斜めバー
  bar: {
    purple: 'decoration-bar-purple',
    cyan: 'decoration-bar-cyan',
    yellow: 'decoration-bar-yellow',
  },
  // ドット
  dot: {
    purple: 'decoration-dot dot-purple',
    cyan: 'decoration-dot dot-cyan',
    yellow: 'decoration-dot dot-yellow',
  },
} as const;

// ===========================
// 共通スタイルの組み合わせ
// ===========================
export const presets = {
  // グラデーションテキスト（アクセント）
  gradientText: `text-transparent bg-clip-text bg-gradient-to-r ${gradients.textAccent}`,

  // プライマリ背景（ネイビー）
  bgNavy: 'bg-navy-950 text-white',

  // アクセント背景（パープル）
  bgAccent: 'bg-accent-600 text-white',

  // セカンダリ背景（シアン）
  bgSecondary: 'bg-secondary-500 text-white',

  // カードベース（ブランドガイドライン準拠）
  cardBase: `bg-white ${radius['2xl']} ${shadows.soft} ${hover.shadow}`,

  // セクションベース（白）
  sectionWhite: `${spacing.section.lg} bg-white`,

  // セクションベース（ライト）
  sectionLight: `${spacing.section.lg} bg-neutral-50`,

  // セクションベース（ネイビー）
  sectionNavy: `${spacing.section.lg} bg-navy-950 text-white`,

  // コンテナ
  containerDefault: `container mx-auto ${spacing.container.wide}`,
} as const;

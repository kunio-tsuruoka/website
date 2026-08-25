/**
 * Beekle Design System - デザイントークン
 *
 * 編集面の可読性と発注判断のしやすさを優先した統一デザインシステム
 * 全ページ・コンポーネントでこれらの定数を使用する
 *
 * カラーパレット:
 * - Primary: Beekle Purple (#3D4DB7)
 * - Accent: Dark Navy (#001738)
 * - Secondary: Vivid Cyan (#00c4cc)
 * - Highlight: Yellow (#ffd600)
 */

// ===========================
// ブランドカラー（Hex）
// ===========================
export const brandColors = {
  // Accent - Dark Navy
  navy: {
    50: '#e6eaf0',
    100: '#c0c9d9',
    500: '#2d4b80',
    800: '#183263',
    950: '#001738',
  },
  // Primary - Beekle Purple
  purple: {
    50: '#f0f1fb',
    100: '#e0e3f6',
    300: '#a2abe4',
    600: '#3D4DB7',
    700: '#2d3a8a',
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
// グラデーション（既存互換。新規UIでは単色面と境界線を優先）
// ===========================
export const gradients = {
  // 既存互換
  primary: 'from-navy-950 to-navy-800',
  primaryHover: 'from-navy-800 to-navy-500',

  // 既存互換
  accent: 'from-accent-600 to-accent-700',
  accentLight: 'from-accent-300 to-accent-600',

  // 既存互換
  secondary: 'from-secondary-500 to-secondary-600',

  // 既存互換
  barPurple: 'from-accent-600 to-accent-300',
  barCyan: 'from-secondary-500 to-secondary-400',
  barYellow: 'from-highlight-500 to-yellow-200',

  // 既存互換
  lightGray: 'from-neutral-50 to-white',
  lightPurple: 'from-accent-50 to-white',
  lightCyan: 'from-secondary-50 to-white',

  // 既存互換
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
// ボーダー半径（編集面の可読性優先）
// ===========================
export const radius = {
  full: 'rounded-full', // ステータス点・円形番号など形状に意味がある要素
  md: 'rounded-md', // ボタン
  lg: 'rounded-lg', // カード、フォーム、情報面
  xl: 'rounded-xl', // 画像など、やや広い面に限定
  '2xl': 'rounded-lg', // 互換用。新規では使わない
  '3xl': 'rounded-lg', // 互換用。新規では使わない
  '[32px]': 'rounded-lg', // 互換用。新規では使わない
  '[40px]': 'rounded-lg', // 互換用。新規では使わない
} as const;

// ===========================
// シャドウ（原則使わず、境界線と面の階層で分ける）
// ===========================
export const shadows = {
  none: 'shadow-none',
  soft: 'shadow-none',
  medium: 'shadow-none',
  strong: 'shadow-none',
  sm: 'shadow-none',
  md: 'shadow-none',
  lg: 'shadow-none',
  xl: 'shadow-none',
  '2xl': 'shadow-none',
  hoverMedium: 'hover:border-primary-300',
  hoverXl: 'hover:border-primary-300',
} as const;

// ===========================
// トランジション
// ===========================
export const transitions = {
  default: 'transition-all',
  colors: 'transition-colors',
  shadow: 'transition-colors',
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
  lift: 'hover:border-primary-300 transition-colors',
  scale: 'hover:border-primary-300 transition-colors',
  shadow: 'hover:border-primary-300 transition-colors',
  opacity: 'hover:opacity-80 transition-opacity',
} as const;

// ===========================
// 装飾要素（旧互換。新規UIでは使わない）
// ===========================
export const decorations = {
  // 旧斜めバー
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
  // 旧グラデーションテキスト互換。新規UIでは単色で扱う。
  gradientText: 'text-accent-950',

  // プライマリ背景（ネイビー）
  bgNavy: 'bg-navy-950 text-white',

  // アクセント背景（パープル）
  bgAccent: 'bg-accent-600 text-white',

  // セカンダリ背景（シアン）
  bgSecondary: 'bg-secondary-500 text-white',

  // カードベース（境界線中心）
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

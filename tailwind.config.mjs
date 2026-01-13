import fs from 'node:fs';
import path from 'node:path';

const themePath = path.join(process.cwd(), 'src', 'theme.json');
const themeConfig = JSON.parse(fs.readFileSync(themePath, 'utf-8'));

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '32px',
        '3xl': '40px',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(0, 23, 56, 0.08)',
        medium: '0 8px 30px -8px rgba(0, 23, 56, 0.12)',
        strong: '0 16px 50px -12px rgba(0, 23, 56, 0.18)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Beekle Purple カラースケール (#3D4DB7)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f0f1fb',
          100: '#e0e3f6',
          200: '#c1c7ed',
          300: '#a2abe4',
          400: '#6e7cce',
          500: '#3D4DB7', // Beekle Purple (Primary)
          600: '#3544a4',
          700: '#2d3a8a',
          800: '#242f70',
          900: '#1c2556',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // Brand Colors - Dark Navy (Primary)
        navy: {
          50: 'hsl(var(--navy-50))',
          100: 'hsl(var(--navy-100))',
          500: 'hsl(var(--navy-500))',
          800: 'hsl(var(--navy-800))',
          950: 'hsl(var(--navy-950))',
        },
        // Brand Colors - Dark Navy (Accent) (#001738)
        accent: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          300: 'hsl(var(--accent-300))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          900: '#001a3d',
          950: '#001738', // Dark Navy
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Brand Colors - Vivid Cyan (Secondary) (#00c4cc)
        secondary: {
          50: '#e6fafa',
          100: '#ccf5f6',
          200: '#99ebec',
          300: '#66e1e3',
          400: '#33d7d9',
          500: '#00c4cc', // Cyan
          600: '#00b0b8',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Brand Colors - Yellow (Highlight) (#ffd600)
        highlight: {
          50: '#fffde6',
          100: '#fff9cc',
          200: '#fff399',
          300: '#ffed66',
          400: '#ffe733',
          500: '#ffd600', // Yellow
          600: '#e6c100',
          DEFAULT: '#ffd600',
        },
        // Brand Colors - Neutral
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Legacy support (gradual migration)
        indigo: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          500: 'hsl(var(--navy-500))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          900: 'hsl(var(--navy-950))',
        },
        purple: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          300: 'hsl(var(--accent-300))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
        },
        pink: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          600: 'hsl(var(--accent-600))',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
      },
    },
    fontFamily: themeConfig.fontFamily,
    fontSize: themeConfig.fontSize,
    spacing: themeConfig.spacing,
  },
  plugins: [
    require('tailwindcss-animate'),
    ({ addBase }) => {
      addBase({
        ':root': {
          ...Object.entries(themeConfig.colors.light).reduce((acc, [key, value]) => {
            acc[`--${key}`] = value;
            return acc;
          }, {}),
          '--radius': themeConfig.borderRadius.radius,
        },
        '.dark': Object.entries(themeConfig.colors.dark).reduce((acc, [key, value]) => {
          acc[`--${key}`] = value;
          return acc;
        }, {}),
      });
    },
  ],
};

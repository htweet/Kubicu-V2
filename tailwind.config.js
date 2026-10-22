const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: token('--canvas'),
        raised: token('--raised'),
        sunken: token('--sunken'),
        overlay: token('--overlay'),
        inverse: token('--inverse'),
        stage: token('--stage'),
        field: token('--field'),
        line: {
          DEFAULT: token('--border-subtle'),
          strong: token('--border-strong'),
        },
        fg: {
          DEFAULT: token('--text-primary'),
          muted: token('--text-secondary'),
          subtle: token('--text-muted'),
          inverse: token('--text-inverse'),
        },
        action: {
          DEFAULT: token('--action'),
          hover: token('--action-hover'),
          pressed: token('--action-pressed'),
          fg: token('--on-action'),
          soft: token('--action-soft'),
        },
        accent: {
          DEFAULT: token('--accent'),
          soft: token('--accent-soft'),
        },
        select: { DEFAULT: token('--select'), fg: token('--on-select') },
        success: { DEFAULT: token('--success'), soft: token('--success-soft') },
        warning: { DEFAULT: token('--warning'), soft: token('--warning-soft') },
        danger: { DEFAULT: token('--danger'), soft: token('--danger-soft') },
        info: { DEFAULT: token('--info'), soft: token('--info-soft') },
        focus: token('--focus'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        /* Page titles use Inter in every visual direction (D31). */
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.028em' }],
        title: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.022em' }],
        heading: ['1.0625rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        body: ['0.9375rem', { lineHeight: '1.55' }],
        label: ['0.8125rem', { lineHeight: '1.35' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
        meta: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};

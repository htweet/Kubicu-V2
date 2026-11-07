/** Accessibility rules every new screen follows (D76). Shown on the design system page. */
export const accessibilityRules = [
  {
    id: 'focus',
    title: 'Focus',
    rule: 'Every interactive element shows the focus ring. Dialogs, sheets and visitor overlays keep Tab inside, close with Escape and return focus to what opened them.',
    use: 'Dialog, Sheet and PageOverlay do this for you through useFocusTrap.',
  },
  {
    id: 'motion',
    title: 'Motion',
    rule: 'When the device asks for less motion, movement becomes a fade or nothing. Never animate keyboard-triggered actions. Single transitions stay under 300ms.',
    use: 'MotionConfig reducedMotion="user" wraps the whole app; CSS transitions are cut by the prefers-reduced-motion rule.',
  },
  {
    id: 'contrast',
    title: 'Contrast',
    rule: 'Text reaches 4.5:1 against what is actually behind it; icons, borders and focus rings reach 3:1. Status always carries a word or icon, never colour alone.',
    use: 'Use theme tokens only. Live pages pass seller colours through liveReadableTheme.',
  },
  {
    id: 'targets',
    title: 'Tap targets',
    rule: 'Anything you can press is at least 24×24px, and main actions on phones are at least 44px tall. Labels never wrap to a second line.',
    use: 'Button, IconButton and table checkboxes already meet this.',
  },
  {
    id: 'announce',
    title: 'Announcements',
    rule: 'Changes that happen without a page change — moves, saves, counts, timers running out — are announced once, politely. Errors are assertive and name the field.',
    use: 'Call announce("…") from utils/announce. Never put a ticking timer in a live region.',
  },
  {
    id: 'structure',
    title: 'Structure',
    rule: 'One h1 per screen with headings in order, a Skip to content link, labelled landmarks, tables with column headers and a caption, and a language on every public page.',
    use: 'PageHeader renders the h1; SkipLink targets #main-content.',
  },
];

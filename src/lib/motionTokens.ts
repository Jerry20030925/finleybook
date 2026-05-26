export const MOTION_DURATION = {
  micro:       0.12,
  fast:        0.16,
  normal:      0.2,
  panel:       0.22,
  route:       0.28,
  routeFlash:  0.26,   // was 0.38 — flash must complete before page is visible
  modal:       0.30,
  toast:       0.22,   // was 0.4 — non-critical; faster feels snappier
  listItem:    0.24,
} as const

export const MOTION_EASE = {
  standard:  [0.22, 1, 0.36, 1] as const,
  out:       'easeOut'          as const,
  in:        'easeIn'           as const,
  overshoot: [0.34, 1.56, 0.64, 1] as const,
  smooth:    [0.4, 0, 0.2, 1]  as const,
  linear:    'linear'           as const,
} as const

export const MOTION_SPRING = {
  badge:          { type: 'spring' as const, stiffness: 360, damping: 22 },
  layout:         { type: 'spring' as const, stiffness: 320, damping: 28 },
  pill:           { type: 'spring' as const, stiffness: 400, damping: 32 },
  panel:          { type: 'spring' as const, stiffness: 280, damping: 28, mass: 0.9 },
  footer:         { type: 'spring' as const, stiffness: 340, damping: 30 },
  // mass raised: scroll progress feels less bouncy on deceleration
  scrollProgress: { stiffness: 120, damping: 32, mass: 0.35 },
  modal:          { type: 'spring' as const, stiffness: 380, damping: 28, mass: 0.8 },
  drawer:         { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.9 },
  listItem:       { type: 'spring' as const, stiffness: 340, damping: 26 },
  // was stiffness 500 — too stiff, tap felt harsh
  button:         { type: 'spring' as const, stiffness: 380, damping: 26 },
  // nav tab active indicator
  navTab:         { type: 'spring' as const, stiffness: 400, damping: 32 },
} as const

/** Reusable variants for list containers with staggered children */
export const LIST_STAGGER_VARIANTS = {
  container: {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.08,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 340,
        damping: 26,
      },
    },
  },
} as const

/** Standard modal overlay + panel entrance variants */
export const MODAL_VARIANTS = {
  overlay: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit:    { opacity: 0, transition: { duration: 0.14 } },
  },
  panel: {
    hidden: { opacity: 0, scale: 0.93, y: 20 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring' as const, stiffness: 380, damping: 28, mass: 0.8 },
    },
    exit: {
      opacity: 0, scale: 0.96, y: 12,
      transition: { duration: 0.16, ease: 'easeIn' as const },
    },
  },
} as const

/** Hover / tap feedback presets for interactive cards & buttons */
export const INTERACTIVE = {
  cardHover:   { y: -4,     transition: { duration: 0.18 } },
  cardTap:     { scale: 0.98 },
  buttonHover: { scale: 1.04 },
  buttonTap:   { scale: 0.94 },
} as const

export const CHART_MOTION = {
  cardReveal:         { duration: MOTION_DURATION.route,      ease: [0.22, 1, 0.36, 1] as const },
  cardRevealDelayed:  { duration: MOTION_DURATION.routeFlash, ease: [0.22, 1, 0.36, 1] as const },
  tooltip:            { duration: MOTION_DURATION.fast,       ease: [0.22, 1, 0.36, 1] as const },
  rowReveal:          { duration: MOTION_DURATION.panel,      ease: [0.22, 1, 0.36, 1] as const },
  rowStagger:         0.04,
  progressFill:       { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  progressFillStagger: 0.05,
  areaDrawMs:         { mobile: 600, desktop: 820 },
  areaDrawDelayMs:    50,
  rechartsEasing:     'ease-out' as const,
} as const

export const MOTION_DURATION = {
  micro: 0.12,
  fast: 0.16,
  normal: 0.2,
  panel: 0.22,
  route: 0.28,
  routeFlash: 0.38,
  modal: 0.32,
  toast: 0.4,
  listItem: 0.24,
} as const

export const MOTION_EASE = {
  standard: [0.22, 1, 0.36, 1] as const,
  out: 'easeOut' as const,
  overshoot: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
} as const

export const MOTION_SPRING = {
  badge: { type: 'spring' as const, stiffness: 360, damping: 20 },
  layout: { type: 'spring' as const, stiffness: 320, damping: 28 },
  pill: { type: 'spring' as const, stiffness: 420, damping: 32 },
  panel: { type: 'spring' as const, stiffness: 280, damping: 28, mass: 0.9 },
  footer: { type: 'spring' as const, stiffness: 340, damping: 30 },
  scrollProgress: { stiffness: 120, damping: 30, mass: 0.2 },
  modal: { type: 'spring' as const, stiffness: 400, damping: 32, mass: 0.8 },
  drawer: { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.9 },
  listItem: { type: 'spring' as const, stiffness: 340, damping: 26 },
  button: { type: 'spring' as const, stiffness: 500, damping: 28 },
} as const

/** Reusable variants for list containers with staggered children */
export const LIST_STAGGER_VARIANTS = {
  container: {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 14, scale: 0.97 },
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
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  },
  panel: {
    hidden: { opacity: 0, scale: 0.92, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 32, mass: 0.8 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 16,
      transition: { duration: 0.18, ease: 'easeIn' as const },
    },
  },
} as const

/** Hover / tap feedback presets for interactive cards & buttons */
export const INTERACTIVE = {
  cardHover: { y: -4, transition: { duration: 0.2 } },
  cardTap: { scale: 0.98 },
  buttonHover: { scale: 1.04 },
  buttonTap: { scale: 0.94 },
} as const

export const CHART_MOTION = {
  cardReveal: { duration: MOTION_DURATION.route, ease: MOTION_EASE.standard },
  cardRevealDelayed: { duration: MOTION_DURATION.routeFlash, ease: MOTION_EASE.standard },
  tooltip: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard },
  rowReveal: { duration: MOTION_DURATION.panel, ease: MOTION_EASE.standard },
  rowStagger: 0.04,
  progressFill: { duration: 0.6, ease: MOTION_EASE.standard },
  progressFillStagger: 0.05,
  areaDrawMs: { mobile: 680, desktop: 920 },
  areaDrawDelayMs: 60,
  rechartsEasing: 'ease-out' as const,
} as const

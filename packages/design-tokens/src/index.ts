export const colors = {
  light: {
    canvas: "#F5F5EF",
    surface: "#FFFFFF",
    text: "#152B26",
    muted: "#52675E",
    primary: "#126C55",
    onPrimary: "#FFFFFF",
    accent: "#D9EF72",
    line: "#DDE5DD",
    boundary: "#6D8277",
    error: "#B91C1C",
    errorSurface: "#FEF2F2",
    soft: "#EDF3EB",
  },
  dark: {
    canvas: "#0E221F",
    surface: "#17352D",
    text: "#F5F5EF",
    muted: "#B6CBC0",
    primary: "#9BE4BF",
    onPrimary: "#0E221F",
    accent: "#D9EF72",
    line: "#36584A",
    boundary: "#A0B8AB",
    error: "#FECACA",
    errorSurface: "#492725",
    soft: "#23463A",
  },
} as const;
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
export const radius = { control: 12, card: 16, sheet: 24 } as const;

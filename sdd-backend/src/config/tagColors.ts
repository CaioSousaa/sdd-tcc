export const TAG_COLORS = [
  '#F59E0B',
  '#EF4444',
  '#22C55E',
  '#3B82F6',
  '#A855F7',
  '#EC4899',
  '#06B6D4',
] as const;

export type TagColor = typeof TAG_COLORS[number];

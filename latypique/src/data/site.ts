/**
 * Site-level switches (not facts about the institute — those live in
 * business.ts).
 */
export const site = {
  /**
   * Print "Photo à venir — <what the photo should show>" on every photo
   * placeholder. Keep it on while the institute's photos are being
   * collected; set it to false to show only the textured surface (e.g. for
   * a soft launch before the photo shoot).
   */
  showPhotoPlaceholderLabels: true,
} as const;

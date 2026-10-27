const artworkIdentifiers = [
  'f20b58b99de12b6e',
  '9b25d8d72395aa62',
  '326df4c1c08c31c8',
  '2a42ba5adc341c3d',
] as const;
const sourceSets = new Map<string, string>([
  ...artworkIdentifiers.map((identifier) => {
    const base = `/figma/art/${identifier}`;
    return [
      `${base}.webp`,
      `${base}-360.webp 360w, ${base}-600.webp 600w, ${base}.webp 900w`,
    ] as const;
  }),
  ...[
    'linen-scholar',
    'olive-explorer',
    'terracotta-traveler',
    'midnight-curator',
    'ivory-listener',
    'burgundy-collector',
  ].map((identifier) => {
    const base = `/art/apes/${identifier}`;
    return [
      `${base}.webp`,
      `${base}-360.webp 360w, ${base}-600.webp 600w, ${base}.webp 900w`,
    ] as const;
  }),
]);
const cardSizes = '(max-width: 767px) calc(50vw - 33px), 258px';
export const detailArtworkSizes = '(max-width: 767px) calc(100vw - 56px), 404px';

/** Delivery metadata for known local artwork; external/API images keep their original fallback. */
export function responsiveArtwork(image: string, sizes = cardSizes) {
  const srcSet = sourceSets.get(image);
  return srcSet ? { srcSet, sizes } : undefined;
}

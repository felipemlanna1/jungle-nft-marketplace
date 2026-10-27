const kurioHero = '/figma/art/f20b58b99de12b6e.webp';
const kurioHeroMobile = '/figma/art/f20b58b99de12b6e-300.webp';
export const criticalMedia = {
  kurioHero,
  kurioHeroMobile,
  kurioHeroMobileSrcSet: `${kurioHeroMobile} 300w, /figma/art/f20b58b99de12b6e-600.webp 600w, ${kurioHero} 900w`,
  kurioHeroMobileSizes: '(max-width: 374px) 108px, 138px',
} as const;

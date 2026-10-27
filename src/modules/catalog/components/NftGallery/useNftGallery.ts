import { useEffect, useState } from 'react';

export const galleryViews = [
  { label: 'Composição completa', zoom: 1, position: '50% 50%' },
  { label: 'Detalhe do rosto', zoom: 1.55, position: '50% 25%' },
  { label: 'Detalhe da composição', zoom: 1.3, position: '25% 70%' },
  { label: 'Textura da obra', zoom: 1.8, position: '70% 70%' },
] as const;
export function useNftGallery(image: string) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  useEffect(() => setSelectedIndex(0), [image]);
  return {
    selectedIndex,
    selectView: setSelectedIndex,
    view: galleryViews[selectedIndex],
    zoomOpen,
    setZoomOpen,
  };
}

import { useEffect, useState } from 'react';

export const galleryViews = [
  { id: 'full', label: 'Composição completa' },
  { id: 'portrait', label: 'Detalhe do rosto' },
  { id: 'composition', label: 'Detalhe da composição' },
  { id: 'texture', label: 'Textura da obra' },
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

import { ZoomIn } from 'lucide-react';
import { Modal } from '../../../../styleguide';
import { detailArtworkSizes, responsiveArtwork } from '../../../../assets/figma/responsiveArtwork';
import { galleryViews, useNftGallery } from './useNftGallery';

export function NftGallery({ image, title }: { image: string; title: string }) {
  const { selectedIndex, selectView, view, zoomOpen, setZoomOpen } = useNftGallery(image);
  return (
    <div className="nft-gallery">
      <div className="nft-gallery-thumbnails" aria-label="Galeria da obra">
        {galleryViews.map((projection, index) => (
          <button
            type="button"
            key={projection.label}
            onClick={() => selectView(index)}
            aria-label={projection.label}
            aria-pressed={selectedIndex === index}
          >
            <img
              src={image}
              {...responsiveArtwork(image, '100px')}
              alt=""
              width="100"
              height="100"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <div className="nft-gallery-stage">
        <div className="nft-gallery-image">
          <img
            src={image}
            {...responsiveArtwork(image, detailArtworkSizes)}
            alt={title}
            width="404"
            height="404"
            fetchPriority="high"
            style={{ transform: `scale(${view.zoom})`, objectPosition: view.position }}
          />
        </div>
        <button
          className="gallery-mobile-preview"
          type="button"
          aria-label="Ampliar obra"
          onClick={() => setZoomOpen(true)}
        />
        <button
          className="gallery-zoom"
          type="button"
          aria-label="Ampliar obra"
          onClick={() => setZoomOpen(true)}
        >
          <ZoomIn size={25} aria-hidden="true" />
        </button>
      </div>
      <Modal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        title={title}
        description="Visualização ampliada da obra."
      >
        <img className="nft-zoom-image" src={image} alt={title} width="900" height="900" />
      </Modal>
    </div>
  );
}

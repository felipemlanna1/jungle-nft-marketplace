import { useHeroBackdrop } from './useHeroBackdrop';

/** Exact geometry and gradient stops from the original decorative Figma SVG. */
export function HeroBackdrop() {
  const { surfaceId, firstOrbId, secondOrbId, maskId } = useHeroBackdrop();
  return (
    <svg
      className="kurio-hero-background kurio-mobile-art"
      preserveAspectRatio="none"
      overflow="visible"
      width="366"
      height="190"
      viewBox="0 0 366 190"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="366" height="190" rx="30" fill={`url(#${surfaceId})`} />
      <mask
        id={maskId}
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="366"
        height="190"
      >
        <rect width="366" height="190" rx="30" fill="#EDEDED" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <circle cx="44" cy="93" r="124" fill={`url(#${firstOrbId})`} />
        <circle cx="197" cy="114" r="124" fill={`url(#${secondOrbId})`} />
      </g>
      <defs>
        <linearGradient
          id={surfaceId}
          x1="5"
          y1="-5.5613e-06"
          x2="366"
          y2="183"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D28A4C" stopOpacity="0.2" />
          <stop offset="1" stopColor="#D28A4C" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          id={firstOrbId}
          x1="69"
          y1="-9.99999"
          x2="139"
          y2="185"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DD9A5F" stopOpacity="0.43" />
          <stop offset="1" stopColor="#D28A4C" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient
          id={secondOrbId}
          x1="222"
          y1="11"
          x2="292"
          y2="206"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DD9A5F" stopOpacity="0.37" />
          <stop offset="1" stopColor="#D28A4C" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

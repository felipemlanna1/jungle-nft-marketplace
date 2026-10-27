export interface MobileNavigationProps {
  count: number;
  signedIn: boolean;
  onMenu: () => void;
  onFavorites: () => void;
}

export interface FooterProps {
  onOpenOptions: () => void;
  onOpenFavorites: () => void;
}

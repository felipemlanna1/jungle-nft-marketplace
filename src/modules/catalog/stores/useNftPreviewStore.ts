import { create } from 'zustand';
import type { NftPreviewState } from '../shared-types';

export const useNftPreviewStore = create<NftPreviewState>((set) => ({
  nftId: null,
  openPreview: (nftId) => set({ nftId }),
  closePreview: () => set({ nftId: null }),
}));

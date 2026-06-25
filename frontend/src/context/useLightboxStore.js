import { create } from 'zustand';

export const useLightboxStore = create((set) => ({
  isOpen: false,
  src: '',
  openLightbox: (src) => {
    if (!src) return;
    set({ isOpen: true, src });
  },
  closeLightbox: () => set({ isOpen: false, src: '' }),
}));

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLightboxStore } from '../../context/useLightboxStore.js';

const ImageLightbox = () => {
  const { isOpen, src, closeLightbox } = useLightboxStore();

  if (!isOpen || !src) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300"
      onClick={closeLightbox}
    >
      {/* Close Button */}
      <button
        onClick={closeLightbox}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        aria-label="Kapat"
      >
        <X size={24} />
      </button>

      {/* Image Container */}
      <div 
        className="relative max-w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking the image
      >
        <img
          src={src}
          alt="Büyütülmüş önizleme"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl scale-in"
        />
      </div>
    </div>,
    document.body
  );
};

export default ImageLightbox;

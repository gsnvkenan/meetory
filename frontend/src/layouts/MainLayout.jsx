import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import MobileHeader from '../components/layout/MobileHeader.jsx';
import ImageLightbox from '../components/common/ImageLightbox.jsx';

const MainLayout = () => (
  <div className="flex min-h-screen">
    <Sidebar />

    <main className="flex-1 min-w-0 pb-20 lg:pb-0">
      <MobileHeader />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </div>
    </main>


    <BottomNav />

    <ImageLightbox />

    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface-2)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          fontSize: '14px',
        },
      }}
    />
  </div>
);

export default MainLayout;

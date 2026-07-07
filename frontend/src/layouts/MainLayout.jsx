import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "../components/layout/Sidebar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import MobileHeader from "../components/layout/MobileHeader.jsx";
import RightSidebar from "../components/layout/RightSidebar.jsx";
import ImageLightbox from "../components/common/ImageLightbox.jsx";

const MainLayout = () => (
  <div className="flex min-h-screen justify-center max-w-[1440px] mx-auto">
    <Sidebar />

    <main className="flex-1 min-w-0 max-w-2xl pb-20 lg:pb-0 lg:border-x border-[var(--color-border)]">
      <MobileHeader />
      <div className="px-4 py-6">
        <Outlet />
      </div>
    </main>

    <RightSidebar />

    <BottomNav />

    <ImageLightbox />

    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          fontSize: "14px",
          boxShadow: "var(--shadow-lg)",
        },
      }}
    />
  </div>
);

export default MainLayout;

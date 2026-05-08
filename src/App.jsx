import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { initEmailJs } from "./services/emailService";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ListingPage from "./pages/ListingPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AuthPage from "./pages/AuthPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardRouterPage from "./pages/DashboardRouterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PostPropertyPage from "./pages/PostPropertyPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import PlansPage from "./pages/PlansPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages that manage their own full-height layout (sidebars etc.)
const FULL_HEIGHT_PATHS = ["/listings", "/dashboard", "/admin/dashboard", "/auth", "/admin/login"];

const AppShell = () => {
  const location = useLocation();
  const isFullHeight = FULL_HEIGHT_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    initEmailJs();
  }, []);

  const hideNavbar = ["/admin/login"].some((p) => location.pathname.startsWith(p));
  const hideFooter = ["/auth", "/admin/login"].some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      {!hideNavbar && <Navbar />}
      <main className={`flex-1 ${isFullHeight || hideNavbar ? "" : "pt-4 pb-12 md:pt-6"}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/listings" element={<ListingPage />} />
          <Route path="/property/:id/:slug?" element={<PropertyDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/adminlogin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <PlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-property"
            element={
              <ProtectedRoute>
                <PostPropertyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-property/:id"
            element={
              <ProtectedRoute>
                <EditPropertyPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;

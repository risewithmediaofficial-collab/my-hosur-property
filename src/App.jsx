import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { initEmailJs } from "./services/emailService";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { PrivateRouteSeo } from "./components/SeoHead";
import ProtectedRoute from "./components/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ListingPage = lazy(() => import("./pages/ListingPage"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const DashboardRouterPage = lazy(() => import("./pages/DashboardRouterPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const PostPropertyPage = lazy(() => import("./pages/PostPropertyPage"));
const EditPropertyPage = lazy(() => import("./pages/EditPropertyPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Pages that manage their own full-height layout (sidebars etc.)
const FULL_HEIGHT_PATHS = ["/listings", "/dashboard", "/admin/dashboard", "/auth", "/admin/login"];
const PRIVATE_PATHS = ["/auth", "/dashboard", "/admin", "/post-property", "/edit-property", "/plans"];

const RouteFallback = () => <Loader text="Loading page..." size={44} />;

const AppShell = () => {
  const location = useLocation();
  const isFullHeight = FULL_HEIGHT_PATHS.some((p) => location.pathname.startsWith(p));
  const isPrivatePath = PRIVATE_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    initEmailJs();
  }, []);

  const hideNavbar = ["/admin/login"].some((p) => location.pathname.startsWith(p));
  const hideFooter = ["/auth", "/admin/login"].some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      {isPrivatePath ? <PrivateRouteSeo title="Account" /> : null}
      {!hideNavbar && <Navbar />}
      <main className={`flex-1 ${isFullHeight || hideNavbar ? "" : "pt-4 pb-12 md:pt-6"}`}>
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
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

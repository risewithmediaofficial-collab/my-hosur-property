import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { initEmailJs } from "./services/emailService";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { PrivateRouteSeo } from "./components/SeoHead";
import ProtectedRoute from "./components/ProtectedRoute";
import useLowMotionDevice from "./hooks/useLowMotionDevice";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ListingPage = lazy(() => import("./pages/ListingPage"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const DashboardRouterPage = lazy(() => import("./pages/DashboardRouterPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const PostPropertyPage = lazy(() => import("./pages/PostPropertyPage"));
const EditPropertyPage = lazy(() => import("./pages/EditPropertyPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const ServiceRequestPage = lazy(() => import("./pages/ServiceRequestPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Pages that manage their own full-height layout (sidebars etc.)
const FULL_HEIGHT_PATHS = ["/listings", "/dashboard", "/admin/dashboard", "/auth", "/admin/login"];
const PRIVATE_PATHS = ["/auth", "/dashboard", "/admin", "/post-property", "/edit-property", "/plans", "/request-service"];

const RouteFallback = () => <Loader text="Loading page..." size={44} />;

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const AppShell = () => {
  const location = useLocation();
  const lowMotionDevice = useLowMotionDevice();
  const isFullHeight = FULL_HEIGHT_PATHS.some((p) => location.pathname.startsWith(p));
  const isPrivatePath = PRIVATE_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    initEmailJs();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("low-motion-ui", lowMotionDevice);
    return () => document.documentElement.classList.remove("low-motion-ui");
  }, [lowMotionDevice]);

  // Scroll to top when route changes
  useEffect(() => {
    // Temporarily disable smooth scroll for immediate scroll to top
    const htmlElement = document.documentElement;
    const originalScroll = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = 'auto';
    
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    
    // Restore smooth scroll after a brief delay
    setTimeout(() => {
      htmlElement.style.scrollBehavior = originalScroll;
    }, 50);
  }, [location.pathname]);

  const hideNavbar = ["/admin/login"].some((p) => location.pathname.startsWith(p));
  const hideFooter = ["/auth", "/admin/login"].some((p) => location.pathname.startsWith(p));

  return (
    <MotionConfig reducedMotion={lowMotionDevice ? "always" : "never"}>
      <div className="flex min-h-screen flex-col bg-transparent">
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        {isPrivatePath ? <PrivateRouteSeo title="Account" /> : null}
        {!hideNavbar && <Navbar />}
        <main className={`flex-1 ${isFullHeight || hideNavbar ? "" : "pt-4 pb-12 md:pt-6"}`}>
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={lowMotionDevice ? undefined : pageTransition}
                initial={lowMotionDevice ? false : "initial"}
                animate={lowMotionDevice ? false : "animate"}
                exit={lowMotionDevice ? undefined : "exit"}
              >
                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/services" element={<ServicesPage />} />
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
                    path="/request-service"
                    element={
                      <ProtectedRoute>
                        <ServiceRequestPage />
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
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
        {!hideFooter && <Footer />}
      </div>
    </MotionConfig>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;

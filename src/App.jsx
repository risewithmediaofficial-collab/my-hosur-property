import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { initEmailJs } from "./services/emailService";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { PrivateRouteSeo } from "./components/SeoHead";
import ProtectedRoute from "./components/ProtectedRoute";
import useLowMotionDevice from "./hooks/useLowMotionDevice";
import { buildListingPath, getBestListingRoutePath } from "./utils/seoRoutes";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ListingPage = lazy(() => import("./pages/ListingPage"));
const AgentsPage = lazy(() => import("./pages/AgentsPage"));
const AgentProfilePage = lazy(() => import("./pages/AgentProfilePage"));
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

const LISTING_PATHS = ["/buy", "/rent", "/plots", "/villas", "/apartments", "/commercial", "/hosur"];
const FULL_HEIGHT_PATHS = [...LISTING_PATHS, "/dashboard", "/admin/dashboard", "/login", "/auth", "/admin/login"];
const PRIVATE_PATHS = ["/auth", "/login", "/dashboard", "/admin", "/post-property", "/edit-property", "/plans", "/request-service"];

const RouteFallback = () => <Loader text="Loading page..." size={44} />;

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const LegacyListingsRedirect = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filters = {
    intent: params.get("intent") || "",
    search: params.get("search") || "",
    city: params.get("city") || "",
    area: params.get("area") || "",
    propertyType: params.get("propertyType") || "",
    furnishingStatus: params.get("furnishingStatus") || "",
    minBhk: params.get("minBhk") || "",
    maxBhk: params.get("maxBhk") || "",
    possessionStatus: params.get("possessionStatus") || "",
    verified: params.get("verified") || "",
    listingSource: params.get("listingSource") || "",
    amenities: params.get("amenities") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    sort: params.get("sort") || "",
  };

  return <Navigate to={buildListingPath(getBestListingRoutePath(filters), filters, {})} replace />;
};

const LegacyLoginRedirect = () => <Navigate to="/login" replace />;

const AppShell = () => {
  const location = useLocation();
  const lowMotionDevice = useLowMotionDevice();
  const isFullHeight = FULL_HEIGHT_PATHS.some((path) => location.pathname.startsWith(path));
  const isPrivatePath = PRIVATE_PATHS.some((path) => location.pathname.startsWith(path));
  const isDashboardRoute = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin/dashboard");

  useEffect(() => {
    initEmailJs();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("low-motion-ui", lowMotionDevice);
    return () => document.documentElement.classList.remove("low-motion-ui");
  }, [lowMotionDevice]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const originalScroll = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = "auto";

    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    setTimeout(() => {
      htmlElement.style.scrollBehavior = originalScroll;
    }, 50);
  }, [location.pathname]);

  const hideNavbar = ["/admin/login"].some((path) => location.pathname.startsWith(path));
  const hideFooter = ["/login", "/auth", "/admin/login"].some((path) => location.pathname.startsWith(path)) || isDashboardRoute;

  return (
    <HelmetProvider>
      <MotionConfig reducedMotion={lowMotionDevice ? "always" : "never"}>
        <div className={`flex min-h-screen flex-col bg-transparent ${isDashboardRoute ? "md:h-screen md:overflow-hidden" : ""}`}>
          <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
          {isPrivatePath ? <PrivateRouteSeo title="Account" /> : null}
          {!hideNavbar && <Navbar />}
          <main className={`flex-1 ${isFullHeight || hideNavbar ? "" : "pt-4 pb-12 md:pt-6"} ${isDashboardRoute ? "md:min-h-0 md:overflow-hidden" : ""}`}>
            <Suspense fallback={<RouteFallback />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={lowMotionDevice ? undefined : pageTransition}
                  initial={lowMotionDevice ? false : "initial"}
                  animate={lowMotionDevice ? false : "animate"}
                  exit={lowMotionDevice ? undefined : "exit"}
                  className={isDashboardRoute ? "h-full min-h-0" : ""}
                >
                  <Routes location={location}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/buy" element={<ListingPage routePath="/buy" />} />
                    <Route path="/rent" element={<ListingPage routePath="/rent" />} />
                    <Route path="/plots" element={<ListingPage routePath="/plots" />} />
                    <Route path="/villas" element={<ListingPage routePath="/villas" />} />
                    <Route path="/apartments" element={<ListingPage routePath="/apartments" />} />
                    <Route path="/commercial" element={<ListingPage routePath="/commercial" />} />
                    <Route path="/hosur/villas" element={<ListingPage routePath="/hosur/villas" />} />
                    <Route path="/hosur/plots" element={<ListingPage routePath="/hosur/plots" />} />
                    <Route path="/hosur/apartments" element={<ListingPage routePath="/hosur/apartments" />} />
                    <Route path="/hosur/commercial" element={<ListingPage routePath="/hosur/commercial" />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/agent/:slug" element={<AgentProfilePage />} />
                    <Route path="/property/:slug" element={<PropertyDetailPage />} />
                    <Route path="/property/:id/:legacySlug" element={<PropertyDetailPage lookupBy="id" />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/listings" element={<LegacyListingsRedirect />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/auth" element={<LegacyLoginRedirect />} />
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
    </HelmetProvider>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;

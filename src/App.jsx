import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import ScrollNavigationButtons from "./components/ScrollNavigationButtons";
import PageBreadcrumbs from "./components/PageBreadcrumbs";
import { PrivateRouteSeo } from "./components/SeoHead";
import ProtectedRoute from "./components/ProtectedRoute";
import useLowMotionDevice from "./hooks/useLowMotionDevice";
import HomePage from "./pages/HomePage";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ListingPage = lazy(() => import("./pages/ListingPage"));
const PropertyDetailPage = lazy(
  () => import("./pages/PropertyDetailPage"),
);
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const DashboardRouterPage = lazy(
  () => import("./pages/DashboardRouterPage"),
);
const AdminDashboardPage = lazy(
  () => import("./pages/AdminDashboardPage"),
);
const PostPropertyPage = lazy(() => import("./pages/PostPropertyPage"));
const EditPropertyPage = lazy(() => import("./pages/EditPropertyPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const ServiceRequestPage = lazy(
  () => import("./pages/ServiceRequestPage"),
);
const BankLoansPage = lazy(() => import("./pages/BankLoansPage"));
const LocationSeoPage = lazy(() => import("./pages/LocationSeoPage"));
const CategoryLandingPage = lazy(() => import("./pages/CategoryLandingPage"));
const BlogIndexPage = lazy(() => import("./pages/BlogIndexPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Pages that manage their own full-height layout (sidebars etc.)
const FULL_HEIGHT_PATHS = [
  "/properties",
  "/listings",
  "/dashboard",
  "/admin/dashboard",
  "/auth",
  "/admin/login",
];
const PRIVATE_PATHS = [
  "/auth",
  "/dashboard",
  "/admin",
  "/post-property",
  "/edit-property",
  "/plans",
  "/request-service",
];

const RouteFallback = () => (
  <div className="min-h-[75vh] grid place-items-center">
    <Loader text="Loading page..." size={44} />
  </div>
);

// Disable browser scroll restoration so refreshing always starts at the top
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const AppShell = () => {
  const location = useLocation();
  const lowMotionDevice = useLowMotionDevice();
  const isFullHeight = FULL_HEIGHT_PATHS.some((p) =>
    location.pathname.startsWith(p),
  );
  const isPrivatePath = PRIVATE_PATHS.some((p) =>
    location.pathname.startsWith(p),
  );
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin/dashboard");
  const isListingsRoute =
    location.pathname.startsWith("/listings") ||
    location.pathname.startsWith("/properties");
  const isHomeRoute = location.pathname === "/";

  useEffect(() => {
    document.documentElement.classList.toggle("low-motion-ui", lowMotionDevice);
    return () => document.documentElement.classList.remove("low-motion-ui");
  }, [lowMotionDevice]);

  useLayoutEffect(() => {
    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    scrollToTop();
    const frame = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  const hideNavbar = ["/admin/login"].some((p) =>
    location.pathname.startsWith(p),
  );
  const hideFooter =
    ["/auth", "/admin/login"].some((p) => location.pathname.startsWith(p)) ||
    isDashboardRoute ||
    isListingsRoute;

  return (
    <MotionConfig reducedMotion={lowMotionDevice ? "always" : "never"}>
      <div
        className={`site-app-shell flex min-h-screen flex-col ${isDashboardRoute ? "site-dashboard-app lg:h-screen lg:overflow-hidden" : ""} ${isListingsRoute ? "site-listings-active" : ""}`}
      >
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        <ScrollNavigationButtons />
        {isPrivatePath ? <PrivateRouteSeo title="Account" /> : null}
        {!hideNavbar && <Navbar />}
        <main
          className={`flex-1 ${isFullHeight || hideNavbar || isHomeRoute ? "" : "pb-12"} ${isListingsRoute ? "flex min-h-0 flex-col" : ""} ${isDashboardRoute ? "flex min-h-0 flex-col overflow-hidden" : ""}`}
        >
          <PageBreadcrumbs />
          <Suspense fallback={<RouteFallback />}>
            <div
              className={
                isListingsRoute || isDashboardRoute
                  ? "flex h-full min-h-0 flex-1 flex-col"
                  : ""
              }
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/bank-loans" element={<BankLoansPage />} />
                <Route path="/properties" element={<ListingPage />} />
                <Route path="/listings" element={<ListingPage />} />
                <Route path="/location/:slug" element={<LocationSeoPage />} />
                <Route
                  path="/hosur-real-estate"
                  element={<CategoryLandingPage pageSlug="hosur-real-estate" />}
                />
                <Route
                  path="/plots-for-sale-in-hosur"
                  element={<CategoryLandingPage pageSlug="plots-for-sale-in-hosur" />}
                />
                <Route
                  path="/land-for-sale-in-hosur"
                  element={<CategoryLandingPage pageSlug="land-for-sale-in-hosur" />}
                />
                <Route
                  path="/villas-for-sale-in-hosur"
                  element={<CategoryLandingPage pageSlug="villas-for-sale-in-hosur" />}
                />
                <Route
                  path="/houses-for-sale-in-hosur"
                  element={<CategoryLandingPage pageSlug="houses-for-sale-in-hosur" />}
                />
                <Route
                  path="/commercial-property-hosur"
                  element={<CategoryLandingPage pageSlug="commercial-property-hosur" />}
                />
                <Route
                  path="/commercial-property-in-hosur"
                  element={<CategoryLandingPage pageSlug="commercial-property-hosur" />}
                />
                <Route
                  path="/farm-land-near-hosur"
                  element={<CategoryLandingPage pageSlug="farm-land-near-hosur" />}
                />
                <Route
                  path="/property-for-rent-in-hosur"
                  element={<CategoryLandingPage pageSlug="property-for-rent-in-hosur" />}
                />
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route
                  path="/property/:id/:slug?"
                  element={<PropertyDetailPage />}
                />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/adminlogin"
                  element={<Navigate to="/admin/login" replace />}
                />
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/login" replace />}
                />
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
                <Route path="/plans" element={<PlansPage />} />
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
            </div>
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

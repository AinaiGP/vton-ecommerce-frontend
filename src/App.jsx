import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect, lazy, Suspense } from "react";
import FloatingChatWidget from "./components/chat/FloatingChatWidget";
import GoogleOnboardingModal from "./components/auth/GoogleOnboardingModal";
import ProtectedRoute, { CustomerRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

// ── Lazy Loaded Pages ────────────────────────────────────────────────────────
const HomePage = lazy(() => import("./pages/HomePage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const Profile = lazy(() => import("./pages/Profile"));
const CustomerProfilePage = lazy(() => import("./pages/CustomerProfilePage"));
const VendorApplicationPage = lazy(() => import("./pages/VendorApplicationPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const WardrobePage = lazy(() => import("./pages/WardrobePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CustomerTicketsPage = lazy(() => import("./pages/CustomerTicketsPage"));
const CustomerReturnsPage = lazy(() => import("./pages/CustomerReturnsPage"));
const CustomerHubPage = lazy(() => import("./pages/CustomerHubPage"));
const SubscribePage = lazy(() => import("./pages/SubscribePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Vendor
const VendorDashboardPage = lazy(() => import("./pages/VendorDashboardPage"));
const VendorProductsPage = lazy(() => import("./pages/VendorProductsPage"));
const VendorOrdersPage = lazy(() => import("./pages/VendorOrdersPage"));
const VendorAnalyticsPage = lazy(() => import("./pages/VendorAnalyticsPage"));
const VendorTicketsPage = lazy(() => import("./pages/VendorTicketsPage"));
const VendorMessagesPage = lazy(() => import("./pages/VendorMessagesPage"));
const VendorEarningsPage = lazy(() => import("./pages/VendorEarningsPage"));
const VendorReviewsPage = lazy(() => import("./pages/VendorReviewsPage"));
const VendorSettingsPage = lazy(() => import("./pages/VendorSettingsPage"));
const VendorInventoryPage = lazy(() => import("./pages/VendorInventoryPage"));
const VendorRefundsPage = lazy(() => import("./pages/VendorRefundsPage"));
const VendorStorefrontPage = lazy(() => import("./pages/VendorStorefrontPage"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminVendors = lazy(() => import("./pages/admin/AdminVendors"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminVendorApplications = lazy(() => import("./pages/admin/AdminVendorApplications"));
const AdminInvitations = lazy(() => import("./pages/admin/AdminInvitations"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));

// Support
const SupportDashboard = lazy(() => import("./pages/support/SupportDashboard"));
const SupportTickets = lazy(() => import("./pages/support/SupportTickets"));
const SupportLiveChat = lazy(() => import("./pages/support/SupportLiveChat"));
const SupportUsers = lazy(() => import("./pages/support/SupportUsers"));
const SupportSettings = lazy(() => import("./pages/support/SupportSettings"));
const SupportProfile = lazy(() => import("./pages/support/SupportProfile"));

// Loading Component
function PageLoader() {
  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--ivory)"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "3px solid var(--ivory-dark)",
        borderTop: "3px solid var(--burgundy)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { isAuthenticated, needsOnboarding, userRole } = useAuth();
  const { refreshCartCount } = useCart();
  const location = useLocation();

  // Hydrate cart count on app load
  useEffect(() => {
    refreshCartCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const observeNewElements = () => {
      const revealElements = document.querySelectorAll(".reveal, .stagger-reveal");
      revealElements.forEach((el) => {
        if (!el.classList.contains("active")) {
          observer.observe(el);
        }
      });
    };

    // Run immediately and on route changes
    observeNewElements();

    // Use MutationObserver for dynamic content
    const mutationObserver = new MutationObserver(() => {
      observeNewElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      {needsOnboarding && location.pathname !== "/onboarding" && (
        <GoogleOnboardingModal />
      )}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/onboarding"
            element={<GoogleOnboardingModal isPage={true} />}
          />
          <Route
            path="/dashboard"
            element={
              <CustomerRoute>
                <DashboardPage />
              </CustomerRoute>
            }
          />

          {/* Vendor Routes */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/analytics"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/tickets"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/messages"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/earnings"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorEarningsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/reviews"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/settings"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/inventory"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/refunds"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorRefundsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors/storefront/:id"
            element={<VendorStorefrontPage />}
          />

          {/* Customer Profile & Hub */}
          <Route
            path="/profile"
            element={
              <CustomerRoute>
                <CustomerProfilePage />
              </CustomerRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <CustomerRoute>
                <WishlistPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/wardrobe"
            element={
              <CustomerRoute>
                <WardrobePage />
              </CustomerRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <CustomerRoute>
                <OrdersPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <CustomerRoute>
                <OrderTrackingPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerRoute>
                <CheckoutPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <CustomerRoute>
                <CustomerTicketsPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <CustomerRoute>
                <CustomerReturnsPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/my-account"
            element={
              <CustomerRoute>
                <CustomerHubPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/subscribe"
            element={
              <CustomerRoute>
                <SubscribePage />
              </CustomerRoute>
            }
          />
          <Route
            path="/apply-vendor"
            element={
              <CustomerRoute>
                <VendorApplicationPage />
              </CustomerRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminVendors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendor-applications"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminVendorApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invitations"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminInvitations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          {/* Support Routes */}
          <Route
            path="/support"
            element={
              <ProtectedRoute requiredRole="technical_support">
                <SupportDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/tickets"
            element={
              <ProtectedRoute requiredRole="technical_support">
                <SupportTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/chat"
            element={
              <ProtectedRoute requiredRole="technical_support">
                <SupportLiveChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/users"
            element={
              <ProtectedRoute requiredRole="technical_support">
                <SupportUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/settings"
            element={
              <ProtectedRoute requiredRole="technical_support">
                <SupportSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/profile"
            element={
              <ProtectedRoute requiredRole="technical_support">
                <SupportProfile />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {(!isAuthenticated || userRole === "customer") && <FloatingChatWidget />}
    </>
  );
}

export default App;

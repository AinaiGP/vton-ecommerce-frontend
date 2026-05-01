import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import FloatingChatWidget from "./components/chat/FloatingChatWidget";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import TryOnHistoryPage from "./pages/TryOnHistoryPage";
import DashboardPage from "./pages/DashboardPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import VendorProductsPage from "./pages/VendorProductsPage";
import VendorOrdersPage from "./pages/VendorOrdersPage";
import VendorAnalyticsPage from "./pages/VendorAnalyticsPage";
import VendorTicketsPage from "./pages/VendorTicketsPage";
import VendorMessagesPage from "./pages/VendorMessagesPage";
import VendorEarningsPage from "./pages/VendorEarningsPage";
import VendorReviewsPage from "./pages/VendorReviewsPage";
import VendorSettingsPage from "./pages/VendorSettingsPage";
import VendorInventoryPage from "./pages/VendorInventoryPage";
import VendorRefundsPage from "./pages/VendorRefundsPage";
import VendorStorefrontPage from "./pages/VendorStorefrontPage";
import Profile from "./pages/Profile";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import VendorApplicationPage from "./pages/VendorApplicationPage";
import WishlistPage from "./pages/WishlistPage";
import WardrobePage from "./pages/WardrobePage";
import OrdersPage from "./pages/OrdersPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminVendorApplications from "./pages/admin/AdminVendorApplications";
import AdminInvitations from "./pages/admin/AdminInvitations";
import AdminProfile from "./pages/admin/AdminProfile";
import GoogleOnboardingModal from "./components/auth/GoogleOnboardingModal";
import ProtectedRoute, { CustomerRoute } from "./components/ProtectedRoute";

import SupportDashboard from "./pages/support/SupportDashboard";
import SupportTickets from "./pages/support/SupportTickets";
import SupportLiveChat from "./pages/support/SupportLiveChat";
import SupportUsers from "./pages/support/SupportUsers";
import SupportReports from "./pages/support/SupportReports";
import SupportSettings from "./pages/support/SupportSettings";
import SupportProfile from "./pages/support/SupportProfile";
import AITryOnPage from "./pages/AITryOnPage";
import CustomerTicketsPage from "./pages/CustomerTicketsPage";
import CustomerReturnsPage from "./pages/CustomerReturnsPage";
import CustomerHubPage from "./pages/CustomerHubPage";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { useEffect, useLayoutEffect } from "react";

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
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/onboarding"
          element={<GoogleOnboardingModal isPage={true} />}
        />
        <Route
          path="/try-on-history"
          element={
            <CustomerRoute>
              <TryOnHistoryPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/ai-try-on"
          element={
            <CustomerRoute>
              <AITryOnPage />
            </CustomerRoute>
          }
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
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
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
          path="/support/reports"
          element={
            <ProtectedRoute requiredRole="technical_support">
              <SupportReports />
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
      </Routes>
      {(!isAuthenticated || userRole === "customer") && <FloatingChatWidget />}
    </>
  );
}

export default App;

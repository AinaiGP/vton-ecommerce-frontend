import { Navigate, Routes, Route } from "react-router-dom";
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
import { useEffect } from "react";

function App() {
  const { isAuthenticated } = useAuth();

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

    const revealElements = document.querySelectorAll(".reveal, .stagger-reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/try-on-history" element={<TryOnHistoryPage />} />
        <Route path="/ai-try-on" element={<AITryOnPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vendor" element={<VendorDashboardPage />} />
        <Route path="/vendor/products" element={<VendorProductsPage />} />
        <Route path="/vendor/orders" element={<VendorOrdersPage />} />
        <Route path="/vendor/analytics" element={<VendorAnalyticsPage />} />
        <Route path="/vendor/tickets" element={<VendorTicketsPage />} />
        <Route path="/vendor/messages" element={<VendorMessagesPage />} />
        <Route path="/vendor/earnings" element={<VendorEarningsPage />} />
        <Route path="/vendor/reviews" element={<VendorReviewsPage />} />
        <Route path="/vendor/settings" element={<VendorSettingsPage />} />
        <Route path="/vendor/inventory" element={<VendorInventoryPage />} />
        <Route path="/vendor/refunds" element={<VendorRefundsPage />} />
        <Route path="/vendors/storefront/:id" element={<VendorStorefrontPage />} />
        <Route path="/profile" element={<CustomerProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderTrackingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/tickets" element={<CustomerTicketsPage />} />
        <Route path="/returns" element={<CustomerReturnsPage />} />
        <Route path="/my-account" element={<CustomerHubPage />} />
        <Route path="/apply-vendor" element={<VendorApplicationPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/vendor-applications" element={<AdminVendorApplications />} />
        <Route path="/admin/invitations" element={<AdminInvitations />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        <Route path="/support" element={<SupportDashboard />} />
        <Route path="/support/tickets" element={<SupportTickets />} />
        <Route path="/support/chat" element={<SupportLiveChat />} />
        <Route path="/support/users" element={<SupportUsers />} />
        <Route path="/support/reports" element={<SupportReports />} />
        <Route path="/support/settings" element={<SupportSettings />} />
        <Route path="/support/profile" element={<SupportProfile />} />
      </Routes>
      <FloatingChatWidget />
    </>
  );
}

export default App;

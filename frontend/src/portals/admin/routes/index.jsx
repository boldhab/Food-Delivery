import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import AdminLayout from "../components/layout/AdminLayout";

// Lazy-loaded Admin Pages
const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const DispatchPage = lazy(() => import("../pages/DispatchPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/OrderDetailPage"));
const FoodsPage = lazy(() => import("../pages/FoodsPage"));
const AddFoodPage = lazy(() => import("../pages/AddFoodPage"));
const EditFoodPage = lazy(() => import("../pages/EditFoodPage"));
const UsersPage = lazy(() => import("../pages/UsersPage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const MessagesPage = lazy(() => import("../pages/MessagesPage"));
const PromotionsPage = lazy(() => import("../pages/PromotionsPage"));

// Polished branded fallback loader for lazy loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Loading view...
      </p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) {
    return <PageLoader />;
  }
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="login" element={<LoginPage />} />

        <Route
          path=""
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage defaultTab="analytics" />} />
          <Route path="live" element={<DispatchPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/pending" element={<OrdersPage />} />
          <Route path="orders/complete" element={<OrdersPage />} />
          <Route path="orders/completed" element={<OrdersPage />} />
          <Route path="orders/canceled" element={<OrdersPage />} />
          <Route path="orders/cancelled" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="foods" element={<FoodsPage />} />
          <Route path="foods/menu" element={<FoodsPage />} />
          <Route path="foods/categories" element={<FoodsPage />} />
          <Route path="foods/add" element={<AddFoodPage />} />
          <Route path="foods/edit/:id" element={<EditFoodPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/customers" element={<UsersPage />} />
          <Route path="users/drivers" element={<UsersPage />} />
          <Route path="users/admins" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/sales" element={<ReportsPage />} />
          <Route path="reports/inventory" element={<ReportsPage />} />
          <Route path="reports/drivers" element={<ReportsPage />} />
          <Route path="reports/sla" element={<ReportsPage />} />
          <Route path="reports/financial" element={<ReportsPage />} />
          <Route path="reports/revenue" element={<ReportsPage />} />
          <Route path="reports/users" element={<ReportsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<MessagesPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/general" element={<SettingsPage />} />
          <Route path="settings/payment" element={<SettingsPage />} />
          <Route path="settings/notifications" element={<SettingsPage />} />
          <Route path="profile" element={<SettingsPage />} />
          <Route path="help" element={<MessagesPage />} />
          <Route path="search" element={<OrdersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

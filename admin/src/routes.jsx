import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./hooks/useAdminAuth";
import AdminLayout from "./components/layout/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import FoodsPage from "./pages/FoodsPage";
import AddFoodPage from "./pages/AddFoodPage";
import EditFoodPage from "./pages/EditFoodPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import MessagesPage from "./pages/MessagesPage";
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};
const AppRoutes = () => {
  return <Routes>
            <Route path="/admin/login" element={<LoginPage />} />

            <Route
    path="/admin"
    element={<PrivateRoute>
                        <AdminLayout />
                    </PrivateRoute>}
  >
                <Route index element={<DashboardPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/pending" element={<OrdersPage />} />
                <Route path="orders/completed" element={<OrdersPage />} />
                <Route path="orders/cancelled" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="foods" element={<FoodsPage />} />
                <Route path="foods/menu" element={<FoodsPage />} />
                <Route path="foods/categories" element={<FoodsPage />} />
                <Route path="foods/inventory" element={<FoodsPage />} />
                <Route path="foods/add" element={<AddFoodPage />} />
                <Route path="foods/edit/:id" element={<EditFoodPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/customers" element={<UsersPage />} />
                <Route path="users/drivers" element={<UsersPage />} />
                <Route path="users/admins" element={<UsersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/sales" element={<ReportsPage />} />
                <Route path="reports/revenue" element={<ReportsPage />} />
                <Route path="reports/users" element={<ReportsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/general" element={<SettingsPage />} />
                <Route path="settings/payment" element={<SettingsPage />} />
                <Route path="settings/notifications" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>;
};
var stdin_default = AppRoutes;
export {
  stdin_default as default
};

import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AvailableOrdersPage from "./pages/AvailableOrdersPage";
import MyDeliveriesPage from "./pages/MyDeliveriesPage";
import DeliveryDetailPage from "./pages/DeliveryDetailPage";
import DriverLayout from "./components/DriverLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/driver/login" element={<LoginPage />} />
      <Route
        path="/driver"
        element={
          <ProtectedRoute>
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/driver/available" replace />} />
        <Route path="available" element={<AvailableOrdersPage />} />
        <Route path="my-deliveries" element={<MyDeliveriesPage />} />
        <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/driver/login" replace />} />
    </Routes>
  );
};

export default App;

import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AdminDataProvider } from "./context/AdminDataContext";
import AppRoutes from "./routes";
import "./App.css";
function App() {
  return <Router>
            <AdminAuthProvider>
                <AdminDataProvider>
                    <AppRoutes />
                    <Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: "#ffffff",
        color: "#333333",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }
    }}
  />
                </AdminDataProvider>
            </AdminAuthProvider>
        </Router>;
}
var stdin_default = App;
export {
  stdin_default as default
};

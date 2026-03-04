import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { DriverAuthProvider } from "./context/DriverAuthContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DriverAuthProvider>
        <App />
        <Toaster position="top-right" />
      </DriverAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

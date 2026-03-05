import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { DriverAuthProvider } from "./context/DriverAuthContext";
import "./styles.css";

window.addEventListener("unhandledrejection", (event) => {
  const reason = event?.reason;
  const message = reason?.message || "";
  if (
    reason?.name === "AbortError" &&
    message.includes("play() request was interrupted by a call to pause()")
  ) {
    event.preventDefault();
  }
});

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

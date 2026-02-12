import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ActiveRideProvider } from "./context/ActiveRideContext";
import { DriverStatusProvider } from "./context/DriverStatusContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <AuthProvider>
      <ActiveRideProvider>
        <DriverStatusProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        </DriverStatusProvider>
      </ActiveRideProvider>
    </AuthProvider>
  </SocketProvider>
);

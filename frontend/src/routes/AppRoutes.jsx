import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyOTP from "../pages/auth/VerifyOTP";

import ClientDashboard from "../pages/client/ClientDashboard";
import BookRide from "../pages/client/BookRide";
import ClientHistory from "../pages/client/ClientHistory";
import ClientProfile from "../pages/client/Profile";
import LiveRide from "../pages/client/LiveRide";

import DriverDashboard from "../pages/driver/DriverDashboard";
import DriverHistory from "../pages/driver/DriverHistory";
import DriverProfile from "../pages/driver/Profile";
import DriverLiveRide from "../pages/driver/DriverLiveRide";
import KYC from "../pages/driver/KYC";

import FareCalculator from "../pages/client/FareCalculator";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";

/* ✅ COMMON NAVBAR (CLIENT + DRIVER) */
import AppNavbar from "../components/AppNavbar";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* ================= CLIENT ================= */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <ClientDashboard />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/book"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <BookRide />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/history"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <ClientHistory />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/profile"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <ClientProfile />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/live/:rideId"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <LiveRide />
            </>
          </ProtectedRoute>
        }
      />

      {/* ================= DRIVER ================= */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <DriverDashboard />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/history"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <DriverHistory />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/profile"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <DriverProfile />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/kyc"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <KYC />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/live/:rideId"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <DriverLiveRide />
            </>
          </ProtectedRoute>
        }
      />

      {/* ================= OTHER ================= */}
      <Route
        path="/fare-test"
        element={
          <ProtectedRoute>
            <>
              <AppNavbar />
              <FareCalculator />
            </>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

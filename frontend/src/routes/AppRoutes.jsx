import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ClientDashboard from "../pages/client/ClientDashboard";
import DriverDashboard from "../pages/driver/DriverDashboard";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";
import FareCalculator from "../pages/client/FareCalculator";
import BookRide from "../pages/client/BookRide";
import KYC from "../pages/driver/KYC";
import LiveRide from "../pages/client/LiveRide";
import DriverLiveRide from "../pages/driver/DriverLiveRide";

import ClientHistory from "../pages/client/ClientHistory";
import DriverHistory from "../pages/driver/DriverHistory";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver"
        element={
          <ProtectedRoute>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />


<Route
  path="/fare-test"
  element={
    <ProtectedRoute>
      <FareCalculator />
    </ProtectedRoute>
  }
/>


<Route
  path="/client/book"
  element={
    <ProtectedRoute>
      <BookRide />
    </ProtectedRoute>
  }
/>


<Route
  path="/driver/kyc"
  element={
    <ProtectedRoute>
      <KYC />
    </ProtectedRoute>
  }
/>



<Route
  path="/client/live/:rideId"
  element={<LiveRide />}
/>

<Route
  path="/driver/live/:rideId"
  element={<DriverLiveRide />}
/>


<Route
  path="/client/history"
  element={
    <ProtectedRoute>
      <ClientHistory />
    </ProtectedRoute>
  }
/>

<Route
  path="/driver/history"
  element={
    <ProtectedRoute>
      <DriverHistory />
    </ProtectedRoute>
  }
/>



      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

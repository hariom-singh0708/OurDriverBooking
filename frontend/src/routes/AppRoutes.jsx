import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyOTP from "../pages/auth/VerifyOTP";

import ClientDashboard from "../pages/client/ClientDashboard";
import BookRide from "../pages/client/BookRide";
import ClientHistory from "../pages/client/ClientHistory";
import LiveRide from "../pages/client/LiveRide";

import DriverHistory from "../pages/driver/DriverHistory";
import HomePage from "../pages/Home/HomePage";
import AdminDrivers from "../pages/admin/Drivers";
import AdminRides from "../pages/admin/Rides";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminSOS from "../pages/admin/SOS";
import WeeklyPayouts from "../pages/admin/WeeklyPayouts";
import PayoutHistory from "../pages/admin/PayoutHistory";
import DriverLiveRide from "../pages/driver/DriverLiveRide";
import KYC from "../pages/driver/KYC";

import FareCalculator from "../pages/client/FareCalculator";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";
import DriverProfile from "../pages/driver/Profile";
import DriverDashboard from "../pages/driver/DriverDashboard";
import ClientProfile from "../pages/client/Profile";
import AdminProfile from "../pages/admin/AdminProfile";


/* ✅ COMMON NAVBAR (CLIENT + DRIVER) */
import AppNavbar from "../components/AppNavbar";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/payouts/history" element={<PayoutHistory />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/drivers" element={<AdminDrivers />} />
      <Route path="/admin/rides" element={<AdminRides />} />
      <Route path="/admin/sos" element={<AdminSOS />} />
      <Route path="/admin/payouts" element={<WeeklyPayouts />} />

      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

    <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <AdminDashboard />
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/drivers"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <AdminDrivers />
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/rides"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <AdminRides />
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/sos"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <AdminSOS />
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/payouts"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <WeeklyPayouts />
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/payouts/history"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <PayoutHistory />
      </>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/profile"
  element={
    <ProtectedRoute>
      <>
        <AppNavbar />
        <AdminProfile />
      </>
    </ProtectedRoute>
  }
/>
     
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
      <AppNavbar />
      <ClientHistory />
    </ProtectedRoute>
  }
/>

<Route
  path="/driver"
  element={
    <ProtectedRoute>
      <AppNavbar/>
      <DriverDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/driver/history"
  element={
    <ProtectedRoute>
      <AppNavbar />
      <DriverHistory />
    </ProtectedRoute>
  }
/>
<Route
  path="/driver/profile"
  element={
    <ProtectedRoute>
      <DriverProfile />
    </ProtectedRoute>
  }
/>



      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

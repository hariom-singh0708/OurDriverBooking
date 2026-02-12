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
import AdminSupport from "../pages/admin/AdminSupport";
import WeeklyPayouts from "../pages/admin/WeeklyPayouts";
import PayoutHistory from "../pages/admin/PayoutHistory";
import DriverLiveRide from "../pages/driver/DriverLiveRide";
import KYC from "../pages/driver/KYC";

import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";
import DriverProfile from "../pages/driver/Profile";
import DriverDashboard from "../pages/driver/DriverDashboard";
import ClientProfile from "../pages/client/Profile";
import AdminProfile from "../pages/admin/AdminProfile";
import DriverHelp from "../pages/driver/DriverHelp";
import HelpSupport from "../pages/client/HelpSupport";
import Navbar from "../pages/Home/Navbar";
import CopyrightFooter from "../pages/Home/CopyrightFooter";
import Services from "../pages/Home/Services";
import PrivacyPolicy from "../pages/Home/Privacy";
import RefundPolicy from "../pages/Home/RefundPolicy";
import TermsOfService from "../pages/Home/TermsOfService";
import DriverRideStart from "../pages/driver/DriverRideStart";
import ContactUs from "../pages/Home/Contact";
import AdminContactEnquiries from "../pages/admin/AdminContactEnquiries";

import AboutUs from "../pages/Home/AboutUs";
export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <>
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
                <AdminProfile />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute>
              <>
                <AdminSupport />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contact"
          element={
            <ProtectedRoute>
              <>
                <AdminContactEnquiries />
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
                <BookRide />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/profile"
          element={
            <ProtectedRoute>
              <>
                <DriverProfile />
              </>
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
          path="/driver"
          element={
            <ProtectedRoute>
              <DriverDashboard />
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
        <Route
          path="/driver/start/:rideId"
          element={
            <ProtectedRoute>

              <DriverRideStart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/help-support"
          element={<HelpSupport />}
        />


        <Route path="/driver/help" element={<DriverHelp />} />
        <Route path="/services" element={<Services />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />


      <Route path="*" element={<NotFound />} />
    </Routes>
    <CopyrightFooter/>
        </>
        


  );
}

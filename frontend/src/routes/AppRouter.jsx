import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeView from "../pages/HomeView";
import LoginView from "../pages/LoginView";
import VerifySuccessView from "../pages/VerifySuccessView";
import VerifyFailedView from "../pages/VerifyFailedView";

import RegisterView from "../pages/RegisterView";
import RoomDetailView from "../pages/RoomDetailView";
import AccountView from "../pages/AccountView";
import ForgotPasswordView from "../pages/ForgotPasswordView";
import ResetPasswordView from "../pages/ResetPasswordView";
import BookingLookupView from "../pages/BookingLookupView";
import BookingView from "../pages/BookingView";
import PaymentView from "../pages/PaymentView";
import BookingSuccessView from "../pages/BookingSuccessView";
import VnpReturnView from "../pages/VnpReturnView";
import PrivateRouteAdmin from "../routes/PrivateRouteAdmin";
import AdminLayout from "../layouts/AdminLayout";
import DashboardView from "../pages/adminPages/DashboardView";
import ManageBookingView from "../pages/adminPages/ManageBookingView";
import ManageRoomView from "../pages/adminPages/ManageRoomView";
import ManageServiceView from "../pages/adminPages/ManageServiceView";
import ManageInvoiceView from "../pages/adminPages/ManageInvoiceView";
import ManageUserView from "../pages/adminPages/ManageUserView";
import ContactView from "../pages/ContactView";


function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/room/:id" element={<RoomDetailView />} />
        <Route path="/account" element={<AccountView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/reset-password/:token" element={<ResetPasswordView />} />
        <Route path="/lookup" element={<BookingLookupView />} />
        <Route path="/booking/:roomId" element={<BookingView />} />
        <Route path="/payment" element={<PaymentView />} />
        <Route path="/booking-success" element={<BookingSuccessView />} />
        <Route path="/vnpay-return" element={<VnpReturnView />} />
        <Route path="/contact" element={<ContactView />} />
        <Route path="/verify-success" element={<VerifySuccessView />} />
        <Route path="/verify-failed" element={<VerifyFailedView />} />


        {/* ADMIN */}
        <Route path="/admin" element={<PrivateRouteAdmin><AdminLayout /></PrivateRouteAdmin>}>
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="bookings" element={<ManageBookingView />} />
        <Route path="rooms" element={<ManageRoomView />} />
        <Route path="services" element={<ManageServiceView />} />
        <Route path="invoices" element={<ManageInvoiceView />} />
        <Route path="users" element={<ManageUserView />} />


        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default AppRouter;

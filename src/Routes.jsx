import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from './components/auth/ProtectedRoute';
import SwipeNavigation from "./components/SwipeNavigation";

const Homepage = React.lazy(() => import('./pages/homepage'));
const FleetDiscovery = React.lazy(() => import('./pages/fleet-discovery'));
const RoadTripAdventures = React.lazy(() => import('./pages/road-trip-adventures'));
const PSVProfessionalServices = React.lazy(() => import('./pages/psv-professional-services'));
const InstantBookingFlow = React.lazy(() => import('./pages/instant-booking-flow'));
const Confirmation = React.lazy(() => import('./pages/instant-booking-flow/Confirmation'));
const BookingSuccess = React.lazy(() => import('./pages/BookingSuccess'));
const MpesaPay = React.lazy(() => import('./pages/mpesa-pay'));
const CustomerRegistration = React.lazy(() => import('./pages/customer-registration'));
const AdminLogin = React.lazy(() => import('./pages/admin-login'));
const AdminCommandCenter = React.lazy(() => import('./pages/admin-command-center'));
const AddVehicle = React.lazy(() => import('./pages/admin-command-center/components/AddVehicle'));
const EditVehicle = React.lazy(() => import('./pages/admin-command-center/components/EditVehicle'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ExamplePage = React.lazy(() => import('./components/responsive/ExamplePage'));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <SwipeNavigation />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adventure-orange"></div>
          </div>
        }>
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/fleet-discovery" element={<FleetDiscovery />} />
            <Route path="/road-trip-adventures" element={<RoadTripAdventures />} />
            <Route path="/psv-professional-services" element={<PSVProfessionalServices />} />
            <Route path="/instant-booking-flow" element={<InstantBookingFlow />} />
            <Route path="/booking-confirmation" element={<Confirmation />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/mpesa-pay" element={<MpesaPay />} />
            <Route path="/customer-registration" element={<CustomerRegistration />} />
            <Route path="/responsive-demo" element={<ExamplePage />} />
            
            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/admin-command-center" 
              element={
                <ProtectedRoute>
                  <AdminCommandCenter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-command-center/add-vehicle" 
              element={
                <ProtectedRoute>
                  <AddVehicle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-command-center/edit-vehicle/:id" 
              element={
                <ProtectedRoute>
                  <EditVehicle />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

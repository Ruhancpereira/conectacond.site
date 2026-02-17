import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Dashboard from "./pages/Dashboard";
import NewTicket from "./pages/NewTicket";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import Bills from "./pages/Bills";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";
import AdminTicketDetail from "./pages/AdminTicketDetail";
import Condos from "./pages/admin/Condos";
import CondoForm from "./pages/admin/CondoForm";
import Licenses from "./pages/admin/Licenses";
import LicenseDetail from "./pages/admin/LicenseDetail";
import LicenseForm from "./pages/admin/LicenseForm";
import DownloadLinkForm from "./pages/admin/DownloadLinkForm";
import SystemLogin from "./pages/system/SystemLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Portal é exclusivo para gestão de licenças (superAdmin). Morador e síndico não têm acesso.
  if (user?.role !== 'superAdmin') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/system/licenses" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {}
      <Route path="/" element={<Navigate to="/system/login" replace />} />
      <Route path="/login/:role" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['resident']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/tickets" element={
        <ProtectedRoute allowedRoles={['resident']}>
          <TicketList />
        </ProtectedRoute>
      } />
      <Route path="/tickets/new" element={
        <ProtectedRoute allowedRoles={['resident']}>
          <NewTicket />
        </ProtectedRoute>
      } />
      <Route path="/tickets/:id" element={
        <ProtectedRoute allowedRoles={['resident']}>
          <TicketDetail />
        </ProtectedRoute>
      } />
      <Route path="/bills" element={
        <ProtectedRoute allowedRoles={['resident']}>
          <Bills />
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/tickets" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminTickets />
        </ProtectedRoute>
      } />
      <Route path="/admin/tickets/:id" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminTicketDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/documents" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Documents />
        </ProtectedRoute>
      } />

      {}
      <Route path="/system/login" element={<SystemLogin />} />

      {}
      <Route path="/system/condos" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <Condos />
        </ProtectedRoute>
      } />
      <Route path="/system/condos/new" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <CondoForm />
        </ProtectedRoute>
      } />
      <Route path="/system/condos/:id/edit" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <CondoForm />
        </ProtectedRoute>
      } />

      {}
      <Route path="/system/licenses" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <Licenses />
        </ProtectedRoute>
      } />
      <Route path="/system/licenses/new" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <LicenseForm />
        </ProtectedRoute>
      } />
      <Route path="/system/licenses/:id" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <LicenseDetail />
        </ProtectedRoute>
      } />
      <Route path="/system/licenses/:id/edit" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <LicenseForm />
        </ProtectedRoute>
      } />
      <Route path="/system/licenses/:id/download-links/new" element={
        <ProtectedRoute allowedRoles={['superAdmin']}>
          <DownloadLinkForm />
        </ProtectedRoute>
      } />

      {}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import CarDetail from "./pages/CarDetail";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CarForm from "./pages/CarForm";

const ProtectedRoute = ({ children }) => {
  const { admin, ready } = useAuth();
  if (!ready) return <div className="min-h-screen grid place-items-center text-zinc-400">Loading…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/cars" element={<PublicLayout><Browse /></PublicLayout>} />
          <Route path="/cars/:id" element={<PublicLayout><CarDetail /></PublicLayout>} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/cars/new" element={<ProtectedRoute><CarForm /></ProtectedRoute>} />
          <Route path="/admin/cars/:id/edit" element={<ProtectedRoute><CarForm /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

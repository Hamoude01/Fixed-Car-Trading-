import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import CarDetail from "./pages/CarDetail";
import SellYourCar from "./pages/SellYourCar";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminOverview from "./pages/admin/Overview";
import AdminListings from "./pages/admin/Listings";
import AdminSubmissions from "./pages/admin/Submissions";
import AdminMessages from "./pages/admin/Messages";
import CarForm from "./pages/admin/CarForm";

const ProtectedRoute = ({ children }) => {
  const { admin, ready } = useAuth();
  if (!ready) return <div className="min-h-screen grid place-items-center text-[#888]">Loading…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <div className="grain">
    <Header />
    <main className="min-h-screen relative z-[2]">{children}</main>
    <Footer />
    <FloatingWhatsApp />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" theme="dark" richColors
          toastOptions={{ style: { background: "#121212", border: "1px solid #2B2B2B", color: "#F9F9F9" } }} />
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/cars" element={<PublicLayout><Browse /></PublicLayout>} />
          <Route path="/cars/:id" element={<PublicLayout><CarDetail /></PublicLayout>} />
          <Route path="/sell" element={<PublicLayout><SellYourCar /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="listings/new" element={<CarForm />} />
            <Route path="listings/:id/edit" element={<CarForm />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

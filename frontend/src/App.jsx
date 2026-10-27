import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Camiones from "./pages/Camiones";
import Carros from "./pages/Carros";
import Alquiler from "./pages/Alquiler";
import Vacantes from "./pages/Vacantes";
import Contacto from "./pages/Contacto";
import Inventario from "./pages/Inventario";
import VehicleDetail from "./pages/VehicleDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import RequireAdmin from "./components/RequireAdmin";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
          <div>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/camiones" element={<Camiones />} />
                <Route path="/carros" element={<Carros />} />
                <Route path="/vehiculos" element={<Inventario />} />
                <Route path="/vehiculos/:id" element={<VehicleDetail />} />
                <Route path="/alquiler" element={<Alquiler />} />
                <Route path="/vacantes" element={<Vacantes />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/contacto/:servicio" element={<Contacto />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route element={<RequireAdmin />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

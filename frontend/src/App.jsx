import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CropPlanning from "./pages/CropPlanning";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="overflow-auto scrollbar-hide">
      <BrowserRouter>
        <Navbar />
        <div className="pt-17">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cropplanning"
              element={
                <ProtectedRoute>
                  <CropPlanning />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/farmerSlice";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import images from "src/services/images";

export default function Navbar() {
  const { isLoggedIn, farmer } = useSelector((state) => state.farmer);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const isActive = (path) =>
    location.pathname === path ? "text-green-600 underline font-semibold" : "";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-green-100 shadow-sm px-6 py-3 rounded-b-2xl">
      <div className="flex items-center justify-between mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={images.logo}
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold text-green-700 tracking-tight">
            Crop Companion
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`hover:text-green-600 transition ${isActive("/")}`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`hover:text-green-600 transition ${isActive("/about")}`}
          >
            About Us
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/cropplanning"
                className={`hover:text-green-600 transition ${isActive(
                  "/cropplanning"
                )}`}
              >
                Crop Planning
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-1 text-green-700 hover:text-green-800"
                >
                  {farmer.name}
                  <ChevronDown size={18} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-green-100 rounded-xl shadow-lg py-2 w-40 z-50">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-green-50 text-sm"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`bg-green-100 text-green-700 px-4 py-1.5 rounded-md hover:bg-green-200 transition ${isActive(
                  "/login"
                )}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`border border-green-400 text-green-800 px-4 py-1.5 rounded-md hover:bg-green-100 transition ${isActive(
                  "/register"
                )}`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-green-700" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm font-medium px-4">
          <Link to="/" className={`transition ${isActive("/")}`}>
            Home
          </Link>
          <Link to="/about" className={`transition ${isActive("/about")}`}>
            About Us
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/cropplanning"
                className={`transition ${isActive("/cropplanning")}`}
              >
                Crop Planning
              </Link>
              <Link
                to="/dashboard"
                className={`transition ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
              <button
                onClick={() => dispatch(logout())}
                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition ${isActive(
                  "/login"
                )}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`border border-green-300 px-3 py-1 rounded hover:bg-green-100 hover:text-green-800 transition ${isActive(
                  "/register"
                )}`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

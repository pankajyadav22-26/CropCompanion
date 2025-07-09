import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import images from "src/services/images";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-green-50 to-white text-green-900 pt-5 px-6 border-t mt-24">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img
              src={images.logo}
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-semibold tracking-wide">
              Crop Companion
            </span>
          </div>
          <p className="text-sm text-green-700">
            Helping farmers plan smarter and grow better using modern tools.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-green-600 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-green-600 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/cropplanning"
                className="hover:text-green-600 transition"
              >
                Crop Planning
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-green-600 transition">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/login" className="hover:text-green-600 transition">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-green-600 transition">
                Register
              </Link>
            </li>
            <li>
              <a
                href="mailto:support@cropcompanion.com"
                className="hover:text-green-600 transition"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 mt-2 text-green-700">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-green-600 transition-all hover:scale-110"
            >
              <Facebook size={22} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-green-600 transition-all hover:scale-110"
            >
              <Instagram size={22} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-green-600 transition-all hover:scale-110"
            >
              <Twitter size={22} />
            </a>
            <a
              href="mailto:support@cropcompanion.com"
              aria-label="Email"
              className="hover:text-green-600 transition-all hover:scale-110"
            >
              <Mail size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-3 text-center text-sm text-green-700 border-t border-green-200 pt-4 pb-1">
        &copy; {new Date().getFullYear()} Crop Companion. All rights reserved.
      </div>
    </footer>
  );
}

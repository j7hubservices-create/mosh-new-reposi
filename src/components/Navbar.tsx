import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/salem-logo-new.jpg";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      {/* Top bar (desktop only) */}
      <div className="hidden md:flex justify-between items-center px-8 py-2 bg-primary text-white text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>No. 23, Oshodi Road, Lagos, Nigeria</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="mailto:info@salemfashion.com" className="flex items-center gap-2 hover:underline">
            <Mail className="w-4 h-4" /> info@salemfashion.com
          </a>
          <a href="tel:+2348134813380" className="flex items-center gap-2 hover:underline">
            <Phone className="w-4 h-4" /> +234 813 481 3380
          </a>
          {/* Socials */}
          <div className="flex gap-4">
            <a href="https://facebook.com/salemfashion" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook text-white text-lg hover:text-gray-200"></i>
            </a>
            <a href="https://instagram.com/salemfashion" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram text-white text-lg hover:text-gray-200"></i>
            </a>
            <a href="https://tiktok.com/@salemfashion" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-tiktok text-white text-lg hover:text-gray-200"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-3 bg-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Salem Logo" className="h-10 w-auto rounded-md" />
          <span className="text-lg font-bold text-primary hidden md:inline">Salem Fashion</span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
          <li>
            <Link to="/" className="hover:text-primary">Home</Link>
          </li>
          <li>
            <Link to="/bales" className="hover:text-primary">Bales</Link>
          </li>
          <li>
            <Link to="/size-chart" className="hover:text-primary">Size Chart</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </li>
        </ul>

        {/* Desktop address right side */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Lagos, Nigeria</span>
        </div>

        {/* Mobile menu button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-800 focus:outline-none">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 shadow-lg">
          <ul className="flex flex-col gap-4 text-gray-700 font-medium">
            <li>
              <Link to="/" onClick={toggleMenu} className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/bales" onClick={toggleMenu} className="hover:text-primary">
                Bales
              </Link>
            </li>
            <li>
              <Link to="/size-chart" onClick={toggleMenu} className="hover:text-primary">
                Size Chart
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={toggleMenu} className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>

          {/* Mobile map icon only */}
          <div className="flex justify-center mt-6">
            <a
              href="https://goo.gl/maps/XXXXX" // optional map link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-primary text-white rounded-full w-10 h-10"
            >
              <MapPin className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

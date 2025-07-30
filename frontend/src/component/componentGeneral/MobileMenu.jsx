import React from "react";
import { Link } from "react-router-dom";

const MobileMenu = () => {
  return (
    <div className="lg:hidden">
      <nav className="p-1">
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block p-3 font-semibold">
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" className="block p-3 font-semibold">
              Shop
            </Link>
          </li>

          {/* Static Links */}
          <li>
            <Link to="/about" className="block p-3 font-semibold">
              About
            </Link>
          </li>
          <li>
            <Link to="/blog" className="block p-3 font-semibold">
              Blog
            </Link>
          </li>
          <li>
            <Link to="/contact-us" className="block p-3 font-semibold">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MobileMenu;

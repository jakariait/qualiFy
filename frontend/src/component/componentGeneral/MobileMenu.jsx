import React from "react";
import { Link } from "react-router-dom";
import { menuItems } from "../../utils/menuItems.js"; // Adjust path as needed

const MobileMenu = () => {
  return (
    <div className="lg:hidden">
      <nav className="p-1">
        <ul className="">
          {/* Dynamic Links */}
          {menuItems.map(({ label, path }, index) => (
            <li key={index}>
              <Link
                to={path}
                className="block accentTextColor p-3 font-semibold"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MobileMenu;

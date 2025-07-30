import React from "react";
import { Link } from "react-router-dom";

const MenuBar = () => (
  <nav className="p-3 xl:container xl:mx-auto">
    <ul className="lg:flex space-x-3">
      <li className="px-4 py-2 text-gray-800 font-semibold cursor-pointer">
        <Link to="/">Home</Link>
      </li>
      <li className="px-4 py-2 text-gray-800 font-semibold cursor-pointer">
        <Link to="/shop">Shop</Link>
      </li>
    </ul>
  </nav>
);

export default MenuBar;

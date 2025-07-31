import React from "react";
import { Link } from "react-router-dom";

const MenuBar = () => {
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Our Courses", path: "/" },
    { label: "Books", path: "/" },
    { label: "Free Resources", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Live Exam", path: "/" },

  ];

  return (
    <nav className="p-3 xl:container xl:mx-auto">
      <ul className="lg:flex space-x-3">
        {menuItems.map(({ label, path }, index) => (
          <li
            key={index}
            className="px-4 py-2 font-semibold cursor-pointer primaryTextColor"
          >
            <Link
              to={path}
              className="relative after:content-[''] after:absolute after:left-0 after:top-7 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MenuBar;

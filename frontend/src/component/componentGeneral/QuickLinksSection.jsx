import React from "react";
import { Link } from "react-router-dom";
import { quickLinks } from "../../utils/quickLinks.js";

const QuickLinksSection = () => {
  return (
    <div>
      <h1 className="relative mb-3 font-semibold text-lg">
        Quick Links
        <span className="absolute left-0 top-6 w-16 border-b-2 border-gray-300 mt-1"></span>
      </h1>

      <ul className="space-y-2">
        {quickLinks.map(({ label, path }, index) => (
          <li key={index}>
            <Link
              to={path}
              className="relative after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLinksSection;

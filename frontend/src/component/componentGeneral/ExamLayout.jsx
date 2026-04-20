import React from "react";
import Headers from "./Headers.jsx";

const ExamLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-gray-100">
    <Headers />
    <main className="flex-grow">{children}</main>
  </div>
);

export default ExamLayout;

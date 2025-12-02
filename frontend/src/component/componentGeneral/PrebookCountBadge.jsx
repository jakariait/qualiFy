import React from "react";
import { GraduationCap } from "lucide-react";

const PrebookCountBadge = ({ prebook, productId }) => {
  const totalEnrolled = prebook;

  return (
    <span className="flex items-center gap-1 primaryTextColor">
      <GraduationCap className="w-4 h-4 text-indigo-600" />
      Pre-Booked: {isNaN(totalEnrolled) ? "Loading..." : totalEnrolled}
    </span>
  );
};

export default PrebookCountBadge;

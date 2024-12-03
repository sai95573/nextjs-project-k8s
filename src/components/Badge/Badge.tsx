import React from "react";

const Badge = ({ status }: any) => {
  const badgeTypes = {
    BAD: "bg-[#FF433F] text-white",
    LOW: "bg-[#F4B207] text-white",
    NORMAL: "bg-[#4FEC4C] text-white",
  };

  // Get the class name based on the status
  const badgeClass = badgeTypes[status] || "bg-gray-500 text-white"; // Fallback to secondary

  return (
    <span
      className={`rounded-full px-4  font-semibold text-black  ${badgeClass}`}
    >
      {status}
    </span>
  );
};

export default Badge;

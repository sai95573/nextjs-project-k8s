import React from "react";

const Tooltip = ({ content, children }: any) => {
  return (
    <div className="group relative inline-block cursor-pointer">
      {children}
      <div className="absolute bottom-full z-10 mb-2 hidden w-max rounded bg-white px-4 py-2 text-xs text-white shadow-2 group-hover:block">
        {content}
        <span className="absolute left-1/2 top-full z-0 h-3 w-3 -translate-x-1/2 rotate-45 transform bg-white shadow-2"></span>
      </div>
    </div>
  );
};

export default Tooltip;

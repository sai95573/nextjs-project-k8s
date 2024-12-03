import { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa"; // Importing the chevron icons

export default function Accordion({ title, children }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4 ">
      <div className="border-gray-300 rounded-md border bg-white shadow-md">
        <button
          onClick={toggleAccordion}
          className="bg-gray-100 hover:bg-gray-200 flex w-full items-center justify-between p-4 text-left focus:outline-none"
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          {isOpen ? (
            <FaChevronUp className="text-gray-500 h-5 w-5" />
          ) : (
            <FaChevronDown className="text-gray-500 h-5 w-5" />
          )}
        </button>

        {isOpen && (
          <div className="border-gray-300 border-t p-4">{children}</div>
        )}
      </div>
    </div>
  );
}

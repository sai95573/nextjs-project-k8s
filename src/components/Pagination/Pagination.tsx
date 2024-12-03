import React from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  console.log("lll", currentPage, totalPages);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between p-4">
          <button
            className="p-2"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>

          <div className="flex space-x-2">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`p-2 ${pageNumber === currentPage ? "font-bold" : ""}`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            className="p-2"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      ) : null}
    </>
  );
};

export default Pagination;

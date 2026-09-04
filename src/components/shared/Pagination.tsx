"use client";

import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  activeClassName?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  activeClassName = "bg-gray-900 text-white",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors border ${
            page === i + 1
              ? `${activeClassName} border-transparent`
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

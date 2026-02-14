// Composant Checkbox avec label
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
              "transition-all duration-200 cursor-pointer",
              error && "border-red-500",
              props.disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {label && (
            <label className="text-sm text-gray-700 cursor-pointer select-none">
              {label}
            </label>
          )}
        </div>

        {error && (
          <p className="mt-1.5 ml-8 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

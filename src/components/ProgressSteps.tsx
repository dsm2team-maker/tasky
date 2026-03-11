import React from "react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void; // Navigation cliquable
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  completedSteps = [],
  onStepClick,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;
          const isClickable = onStepClick && (isPast || isCompleted);

          return (
            <React.Fragment key={stepNumber}>
              {/* Cercle de l'étape */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  title={
                    isClickable ? `Retour à l'étape ${stepNumber}` : undefined
                  }
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    isCompleted || isPast
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-200"
                        : "bg-gray-200 text-gray-400"
                  } ${isClickable ? "cursor-pointer hover:opacity-75 hover:scale-105 hover:ring-2 hover:ring-emerald-300" : "cursor-default"}`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  className={`text-xs mt-2 font-medium transition-colors ${
                    isClickable
                      ? "text-emerald-600 cursor-pointer hover:text-emerald-700 hover:underline"
                      : isCurrent
                        ? "text-emerald-600"
                        : "text-gray-400"
                  }`}
                >
                  Étape {stepNumber}
                </span>
              </div>

              {/* Ligne de connexion */}
              {stepNumber < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    isPast || isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

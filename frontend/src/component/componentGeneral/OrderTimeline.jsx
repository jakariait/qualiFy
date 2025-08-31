import React from "react";

const OrderTimeline = ({ currentStep }) => {
  const steps = [
    { id: 1, title: "Login/Register" },
    { id: 2, title: "Place Order" },
    { id: 3, title: "Payment" },
  ];

  return (
    <div className="w-full pt-4">
      <div className="flex items-start justify-center">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300`}
                  style={{
                    backgroundColor: isCompleted
                      ? "#22c55e"
                      : isActive
                        ? "#3b82f6"
                        : "#e5e7eb",
                    color: isCompleted || isActive ? "#fff" : "#6b7280",
                  }}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
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
                    step.id
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium text-center ${
                    isActive ? "primaryTextColor" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Dot Connector */}
              {index < steps.length - 1 && (
                <div
                  className="flex-1 flex items-center"
                  style={{ height: 40 }}
                >
                  <div
                    className={`w-full border-t-3 primaryTextColor border-dotted `}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;

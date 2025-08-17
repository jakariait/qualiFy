import React from 'react';

const ExamResultsSkeleton = () => {
  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-3 animate-pulse">
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 shadow-inner rounded-2xl p-3 flex flex-col items-center justify-center h-48">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="bg-gray-100 shadow-inner rounded-2xl p-3 flex flex-col items-center justify-center h-48">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>

      <div className={"bg-gray-50 shadow-inner rounded-2xl p-3"}>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4 mx-auto"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 shadow-inner rounded-2xl py-4 p-3 mb-4">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamResultsSkeleton;

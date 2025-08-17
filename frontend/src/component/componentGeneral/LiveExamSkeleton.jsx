import React from 'react';

const LiveExamSkeleton = () => {
  return (
    <div className="bg-orange-100 shadow-inner rounded-2xl p-3 grid grid-cols-1 gap-4 animate-pulse">
      {/* Exam Title and Timer Skeleton */}
      <div className="bg-gray-50 shadow-inner rounded-2xl py-3 flex flex-col items-center justify-center">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      </div>

      {/* Question Palette Skeleton */}
      <div className="bg-gray-50 shadow-inner rounded-2xl p-3">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-6 gap-2">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>

      {/* Questions Skeleton */}
      <div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-2 p-4 bg-white shadow-inner rounded-2xl">
            <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Buttons Skeleton */}
      <div className="flex flex-col items-center justify-center">
        <div className="h-12 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default LiveExamSkeleton;

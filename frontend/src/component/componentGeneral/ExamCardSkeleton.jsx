import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ExamCardSkeleton = () => {
  return (
    <div className="bg-white  p-6 rounded-xl shadow-md">
      <Skeleton height={28} width="80%" />
      <Skeleton height={20} width="90%" className="mt-4" />
      <div className="flex justify-between mt-4">
        <Skeleton height={20} width="40%" />
        <Skeleton height={20} width="40%" />
      </div>
      <Skeleton height={44} width={120} className="mt-6" />
    </div>
  );
};

export default ExamCardSkeleton;

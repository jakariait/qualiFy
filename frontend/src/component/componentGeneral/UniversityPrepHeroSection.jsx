import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const UniversityPrepHeroSection = () => {
  const [platformInfo, setPlatformInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/platform`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setPlatformInfo(res.data.data);
        } else {
          setError("Failed to load platform info.");
        }
      })
      .catch(() => {
        setError("Failed to load platform info.");
      });
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4 max-w-3xl mx-auto p-8">
      <div className="h-6 bg-gray-300 rounded w-48"></div>
      <div className="h-12 bg-gray-300 rounded w-full"></div>
      <div className="h-20 bg-gray-300 rounded w-full"></div>
      <div className="flex space-x-3">
        <div className="h-6 bg-gray-300 rounded w-24"></div>
        <div className="h-6 bg-gray-300 rounded w-24"></div>
        <div className="h-6 bg-gray-300 rounded w-24"></div>
      </div>
      <div className="h-40 bg-gray-300 rounded"></div>
    </div>
  );

  if (error) {
    return (
      <section className="py-10 px-4 text-center text-red-600">
        <p>{error}</p>
      </section>
    );
  }

  if (!platformInfo) return <LoadingSkeleton />;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="xl:container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left side content */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full text-sm font-medium text-blue-700 animate-fade-in">
              <Award className="w-4 h-4" />
              {platformInfo.mainTitle}
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-5xl  font-bold leading-tight">
              <span className="primaryTextColor heading">{platformInfo.subTitle}</span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl secondaryTextColor leading-relaxed max-w-2xl">
              {platformInfo.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-center">
              <div>
                <p className="text-3xl font-bold primaryTextColor">
                  {platformInfo.students}
                </p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div>
                <p className="text-3xl font-bold primaryTextColor">
                  {platformInfo.successRate}%
                </p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold primaryTextColor">
                  {platformInfo.courses}
                </p>
                <p className="text-sm text-gray-600">Courses</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center lg:justify-start">
              <Link
                to="/register"
                className="primaryBgColor accentTextColor px-5 py-2 cursor-pointer rounded flex justify-center items-center"
              >
                Start Your Journey
              </Link>
              <Link
                to="/courses"
                className="primaryBorderColor border-2 primaryTextColor py-2 px-5 cursor-pointer rounded flex justify-center items-center"
              >
                Explore Courses
              </Link>
            </div>

            {/* Trusted By */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 opacity-70 mt-6">
              <span className="text-sm text-gray-500">Trusted by students from:</span>
              <div className="flex gap-4 text-sm font-medium text-gray-600 flex-wrap max-w-xs">
                {platformInfo.trustedBy.map((item, i) => (
                  <React.Fragment key={i}>
                    <span>{item}</span>
                    {i !== platformInfo.trustedBy.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Modern visual element with platformThumbnail */}
          <div className="hidden md:flex flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main card replaced with platform thumbnail image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {platformInfo.platformThumbnail ? (
                  <img
                    src={`${API_BASE.replace("/api", "")}/uploads/${platformInfo.platformThumbnail}`}
                    alt="Platform Thumbnail"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 animate-pulse" />
                )}
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl transform -rotate-12 animate-float"></div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl transform rotate-12 animate-float delay-1000"></div>
            </div>
          </div>


        </div>
      </div>

      <style jsx>{`
          @keyframes fade-in {
              from {
                  opacity: 0;
                  transform: translateY(10px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }
          .animate-fade-in {
              animation: fade-in 0.6s ease-out;
          }
      `}</style>
    </section>
  );
};

export default UniversityPrepHeroSection;

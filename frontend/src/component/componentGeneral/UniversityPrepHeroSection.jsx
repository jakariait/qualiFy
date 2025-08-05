import React from "react";
import { Award } from "lucide-react";
import student from "../../assets/portrait-cheerful-male-international-indian-600nw-2071252046.webp";
import StatsSection from "./StatsSection.jsx";

const UniversityPrepHeroSection = () => {
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
          {/* Left side: Enhanced text content */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full text-sm font-medium text-blue-700 animate-fade-in">
              <Award className="w-4 h-4" />
              #1 Private University Prep Platform
            </div>

            {/* Main heading with gradient text */}
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="primaryTextColor">
                Master Your Path to Top Universities
              </span>
            </h1>

            {/* Enhanced description */}
            <p className="text-lg lg:text-xl secondaryTextColor leading-relaxed max-w-2xl">
              Join thousands of successful students who chose PrivaTune for NSU,
              Personalized coaching meets proven results.
            </p>

            {/* Stats row */}
            <StatsSection />

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className={
                  "primaryBgColor accentTextColor px-5 py-2 cursor-pointer rounded"
                }
              >
                <span>Start Your Journey</span>
              </button>
              <button
                className={
                  "primaryBorderColor border-2 primaryTextColor py-2 px-5 cursor-pointer rounded"
                }
              >
                Explore Courses
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4  opacity-70">
              <span className="text-sm text-gray-500">
                Trusted by students from:
              </span>
              <div className="flex gap-4 text-sm font-medium text-gray-600">
                <span>NSU</span>
                <span>•</span>
                <span>BRAC</span>
                <span>•</span>
                <span>IUB</span>
                <span>•</span>
                <span>AIUB</span>
              </div>
            </div>
          </div>

          {/* Right side: Modern visual element */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main card replaced with image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src={student} // Change this path to your actual image
                  alt="Student Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Floating elements remain */}
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(-12deg);
          }
          50% {
            transform: translateY(-10px) rotate(-12deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default UniversityPrepHeroSection;

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Users, TrendingUp, BookOpen } from "lucide-react";

const StatsSection = () => {
  // Constants for stats
  const STUDENTS_COUNT = 5000;
  const SUCCESS_RATE = 95;
  const COURSES_COUNT = 50;

  // Trigger counting when visible
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-center lg:justify-start gap-6 py-2"
    >
      {/* Students */}
      <div className="flex items-center gap-2 text-gray-700">
        <Users className="w-5 h-5 text-blue-500" />
        <span className="font-semibold">
          {inView && <CountUp end={STUDENTS_COUNT} duration={2} separator="," />}+
        </span>
        <span className="text-sm">Students</span>
      </div>

      {/* Success Rate */}
      <div className="flex items-center gap-2 text-gray-700">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <span className="font-semibold">
          {inView && <CountUp end={SUCCESS_RATE} duration={2} />}%
        </span>
        <span className="text-sm">Success Rate</span>
      </div>

      {/* Courses */}
      <div className="flex items-center gap-2 text-gray-700">
        <BookOpen className="w-5 h-5 text-purple-500" />
        <span className="font-semibold">
          {inView && <CountUp end={COURSES_COUNT} duration={2} />}+
        </span>
        <span className="text-sm">Courses</span>
      </div>
    </div>
  );
};

export default StatsSection;

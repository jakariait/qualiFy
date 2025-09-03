import React, { useState, useRef } from "react";
import { Clock, ChevronUp, ChevronDown, Lock } from "lucide-react";
import { Dialog, DialogContent, Button } from "@mui/material";

const LESSONS_VISIBLE = 6; // Number of lessons to show initially

const LessonSection = ({ modules }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [linkType, setLinkType] = useState("external");
  const [expandedModules, setExpandedModules] = useState({}); // Track expanded state for lessons

  const moduleRefs = useRef([]); // store refs for each module

  if (!Array.isArray(modules) || modules.length === 0) return null;

  const toggle = (index) => {
    const newIndex = activeIndex === index ? null : index;
    setActiveIndex(newIndex);

    // When a module is opened or closed, collapse its lessons to ensure the "Show More" button is visible on open.
    setExpandedModules((prev) => ({ ...prev, [index]: false }));

    // Scroll to the module when it's opened
    if (newIndex !== null) {
      setTimeout(() => {
        const element = moduleRefs.current[index];
        if (element) {
          const header = document.querySelector("header");
          const offset = header ? header.offsetHeight + 20 : 80;
          const elementTop =
            element.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: elementTop - offset,
            behavior: "smooth",
          });
        }
      }, 300); // Delay to allow accordion animation to start
    }
  };

  const toggleShowAllLessons = (index) => {
    const isCollapsing = expandedModules[index];

    if (isCollapsing) {
      const element = moduleRefs.current[index];
      if (element) {
        const header = document.querySelector("header");
        const offset = header ? header.offsetHeight + 20 : 80;
        const elementTop = element.getBoundingClientRect().top;

        if (elementTop < offset) {
          const scrollY = window.scrollY;
          const elementScrollTop = elementTop + scrollY;
          window.scrollTo({
            top: elementScrollTop - offset,
            behavior: "smooth",
          });
        }
      }
    }

    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLinkClick = (link) => {
    if (link.includes("youtube.com/watch")) {
      setLinkType("youtube");
      try {
        const url = new URL(link);
        const videoId = url.searchParams.get("v");
        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          setActiveLink(embedUrl);
        } else {
          setActiveLink(link);
        }
      } catch {
        setActiveLink(link);
      }
    } else {
      let isInternal = false;
      try {
        const url = new URL(link);
        if (url.origin === window.location.origin) {
          isInternal = true;
        }
      } catch (e) {
        if (link.startsWith("/")) {
          isInternal = true;
        }
      }

      if (isInternal) {
        setLinkType("internal");
        setActiveLink(link);
      } else {
        setLinkType("external");
        setActiveLink(link);
      }
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setActiveLink("");
  };

  const aspectRatios = {
    youtube: "56.25%", // 16:9
    internal: "225.25%", // custom ratio
    default: "100%",
  };

  return (
    <div className="py-5">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-center">
        Course{" "}
        <span className="relative inline-block primaryTextColor">
          Modules & Resources
          <svg
            className="absolute -bottom-2 left-0 w-full h-3"
            viewBox="0 0 200 12"
            fill="none"
          >
            <path
              d="M2 8C2 8 50 2 100 4C150 6 198 8 198 8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="primaryTextColor"
            />
          </svg>
        </span>
      </h2>

      <div className="space-y-4">
        {modules.map((module, index) => {
          const isExpanded = expandedModules[index];
          const lessonsToShow =
            module.lessons.length > LESSONS_VISIBLE && !isExpanded
              ? module.lessons.slice(0, LESSONS_VISIBLE)
              : module.lessons;

          return (
            <div
              key={module._id || index}
              ref={(el) => (moduleRefs.current[index] = el)} // attach ref
              className="border primaryBorderColor rounded-lg overflow-hidden"
            >
              {/* Header */}
              <p
                className="w-full text-left px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none"
                onClick={() => toggle(index)}
              >
                <h3 className="text-xl font-semibold primaryTextColor">
                  {module.subject}
                </h3>
                <span className="text-2xl text-[#EF6C00]">
                  {activeIndex === index ? (
                    <ChevronUp className="h-6 w-6" />
                  ) : (
                    <ChevronDown className="h-6 w-6" />
                  )}
                </span>
              </p>

              {/* Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden px-4 ${
                  activeIndex === index ? "max-h-[3000px] py-4" : "max-h-0"
                }`}
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {lessonsToShow.map((lesson) => (
                    <div
                      key={lesson._id}
                      className={`bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition group ${
                        lesson.link ? "cursor-pointer" : ""
                      }`}
                      onClick={() =>
                        lesson.link && handleLinkClick(lesson.link)
                      }
                    >
                      {/* Thumbnail */}
                      {lesson.courseThumbnail && (
                        <div className="relative">
                          <img
                            src={`${import.meta.env.VITE_API_URL.replace(
                              "/api",
                              "",
                            )}/uploads/${lesson.courseThumbnail}`}
                            alt={lesson.title}
                            className="w-full object-cover group-hover:scale-102 transition-transform"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="text-lg font-semibold primaryTextColor flex flex-col items-center gap-1 text-center">
                          {lesson.link ? (
                            <span className="text-sm font-medium text-green-600">
                              Free Class
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="break-words leading-tight">
                            {lesson.title}
                          </span>
                        </h4>

                        {lesson.duration && (
                          <div className="flex items-center text-gray-600 text-sm gap-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{lesson.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {module.lessons.length > LESSONS_VISIBLE && (
                  <div className="text-center mt-4">
                    <Button
                      onClick={() => toggleShowAllLessons(index)}
                      variant="outlined"
                      endIcon={isExpanded ? <ChevronUp /> : <ChevronDown />}
                    >
                      {isExpanded ? "Show Less" : "Show More"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{ p: linkType === "youtube" || linkType === "internal" ? 0 : 3 }}
        >
          {linkType === "youtube" || linkType === "internal" ? (
            <div
              style={{
                position: "relative",
                paddingBottom: aspectRatios[linkType] || aspectRatios.default,
                height: 0,
              }}
            >
              <iframe
                src={activeLink}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Lesson Content"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              ></iframe>
            </div>
          ) : (
            <div className="p-8 text-center min-h-64 flex flex-col justify-center items-center">
              <p className="mb-4 text-lg">
                This lesson contains an external link:
              </p>
              <a
                href={activeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all text-xl"
              >
                {activeLink}
              </a>
              <div className="mt-8">
                <Button
                  variant="contained"
                  size="large"
                  href={activeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Link in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonSection;

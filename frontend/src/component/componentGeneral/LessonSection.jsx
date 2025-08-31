import React, { useState } from "react";
import {
  Clock,
  PlayCircle,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const LessonSection = ({ modules }) => {
  const [activeIndex, setActiveIndex] = useState(0); // First module open by default
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [linkType, setLinkType] = useState("external"); // internal, youtube, external

  if (!Array.isArray(modules) || modules.length === 0) return null;

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const isMobile = window.innerWidth < 640;

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
      } catch (error) {
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
    internal: "225.25%", // your custom ratio
    default: "100%", // square
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
        {modules.map((module, index) => (
          <div
            key={module._id || index}
            className="border primaryBorderColor rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
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
            </button>

            {/* Content */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden px-4 ${
                activeIndex === index ? "max-h-[3000px] py-4" : "max-h-0"
              }`}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className={`bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition group ${
                      lesson.link ? "cursor-pointer" : ""
                    }`}
                    onClick={() => lesson.link && handleLinkClick(lesson.link)}
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
                        <span className="break-words leading-tight">{lesson.title}</span>
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
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            p: linkType === "youtube" || linkType === "internal" ? 0 : 3, // no padding for video
          }}
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
            // external
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

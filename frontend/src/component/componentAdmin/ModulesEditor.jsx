import React from "react";
import { Trash2, PlusCircle, Upload } from "lucide-react";

const ModulesEditor = ({ modules, setModules }) => {
  const addModule = () => {
    setModules([
      ...modules,
      {
        subject: "",
        lessons: [],
      },
    ]);
  };

  const removeModule = (idx) => {
    setModules(modules.filter((_, i) => i !== idx));
  };

  const updateModuleSubject = (idx, value) => {
    const updated = [...modules];
    updated[idx].subject = value;
    setModules(updated);
  };

  const addLesson = (moduleIdx) => {
    const updated = [...modules];
    updated[moduleIdx].lessons.push({
      title: "",
      duration: "",
      courseThumbnail: "",
      courseThumbnailFile: null,
    });
    setModules(updated);
  };

  const removeLesson = (moduleIdx, lessonIdx) => {
    const updated = [...modules];
    updated[moduleIdx].lessons.splice(lessonIdx, 1);
    setModules(updated);
  };

  const updateLessonField = (moduleIdx, lessonIdx, field, value) => {
    const updated = [...modules];
    updated[moduleIdx].lessons[lessonIdx][field] = value;
    setModules(updated);
  };

  const handleFileChange = (moduleIdx, lessonIdx, file) => {
    const updated = [...modules];
    updated[moduleIdx].lessons[lessonIdx].courseThumbnailFile = file;
    // Optionally reset courseThumbnail string if uploading new file
    updated[moduleIdx].lessons[lessonIdx].courseThumbnail = "";
    setModules(updated);
  };

  return (
    <div className="p-4 shadow-md rounded-lg mt-4 bg-white">
      <h3 className="font-semibold mb-4 text-lg">Modules</h3>

      {modules.map((module, mIdx) => (
        <div key={mIdx} className="mb-6 rounded-lg shadow-md bg-gray-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <input
              type="text"
              placeholder="Subject"
              value={module.subject}
              onChange={(e) => updateModuleSubject(mIdx, e.target.value)}
              className="px-4 py-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <Trash2
              onClick={() => removeModule(mIdx)}
              size={28}
              className="cursor-pointer text-red-600 hover:text-red-800"
              title="Remove Module"
              aria-label="Remove Module"
            />
          </div>

          {/* Lessons */}
          <div className="mt-4">
            {module.lessons.map((lesson, lIdx) => {
              // Prepare preview URL for uploaded file or existing thumbnail
              const previewUrl = lesson.courseThumbnailFile
                ? URL.createObjectURL(lesson.courseThumbnailFile)
                : lesson.courseThumbnail
                  ? `${import.meta.env.VITE_API_URL.replace(
                    "/api",
                    ""
                  )}/uploads/${lesson.courseThumbnail}`
                  : null;

              return (
                <div
                  key={lIdx}
                  className="flex flex-col md:flex-row md:items-center gap-4 bg-white shadow-sm p-3 rounded-md mb-3"
                >
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lesson.title}
                    onChange={(e) =>
                      updateLessonField(mIdx, lIdx, "title", e.target.value)
                    }
                    className="px-4 py-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={lesson.duration}
                    onChange={(e) =>
                      updateLessonField(mIdx, lIdx, "duration", e.target.value)
                    }
                    className="px-4 py-2 border rounded-md w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-col items-center min-w-[90px]">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Lesson Thumbnail"
                        className="w-20 h-20 object-cover rounded-md mb-2"
                      />
                    )}
                    <label className="cursor-pointer inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow select-none">
                      <Upload size={18} className="mr-2" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(mIdx, lIdx, e.target.files[0])
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                  <Trash2
                    onClick={() => removeLesson(mIdx, lIdx)}
                    size={28}
                    className="cursor-pointer text-red-600 hover:text-red-800"
                    title="Remove Lesson"
                    aria-label="Remove Lesson"
                  />
                </div>
              );
            })}

            <div className="flex justify-end mt-2">
              <PlusCircle
                onClick={() => addLesson(mIdx)}
                size={32}
                className="cursor-pointer text-green-600 hover:text-green-800"
                title="Add Lesson"
                aria-label="Add Lesson"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <PlusCircle
          onClick={addModule}
          size={36}
          className="cursor-pointer text-green-700 hover:text-green-900"
          title="Add Module"
          aria-label="Add Module"
        />
      </div>
    </div>
  );
};

export default ModulesEditor;

import { useEffect, useRef } from "react";
import { Editor } from "primereact/editor";

const QuestionEditorWithLatex = ({ value, onTextChange }) => {
  const previewRef = useRef(null);

  // Load MathJax once
  useEffect(() => {
    if (!window.MathJax) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Re-render MathJax whenever value changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([previewRef.current]);
    }
  }, [value]);

  return (
    <div className="space-y-2 mt-2">
      {/* Editor */}
      <Editor
        value={value}
        onTextChange={onTextChange}
        style={{ height: "120px", marginTop: "8px" }}
      />

      {/* Live LaTeX Preview */}
      <div
        ref={previewRef}
        className="border rounded p-2 bg-white shadow-sm"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

export default QuestionEditorWithLatex;

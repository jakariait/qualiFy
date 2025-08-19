import { useEffect, useRef } from "react";

const QuestionPreview = ({ content }) => {
  const previewRef = useRef(null);

  // Load MathJax once
  useEffect(() => {
    if (!window.MathJax) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Re-render MathJax whenever content changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([previewRef.current]);
    }
  }, [content]);

  return (
    <div
      ref={previewRef}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default QuestionPreview;

import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

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

  // Sanitize content with DOMPurify
  const sanitizedContent = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true }, // allow HTML tags
  });

  return (
    <div
      ref={previewRef}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default QuestionPreview;

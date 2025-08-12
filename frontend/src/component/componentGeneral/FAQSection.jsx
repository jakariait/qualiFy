import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const FAQSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await axios.get(`${apiUrl}/faq`);
        const publishedFaqs =
          res.data?.data?.filter((faq) => faq.status === "published") || [];
        setFaqs(publishedFaqs);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [apiUrl]);

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-white py-10 xl:container xl:mx-auto px-4 md:px-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="font-bold text-3xl md:text-5xl primaryTextColor">
          Frequently Asked Questions
        </h2>
        <div className="h-1 w-20 secondaryBgColor mx-auto rounded-full mt-4 shadow-md"></div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid"></div>
        </div>
      ) : (
        <div className="grid gap-6 max-w-6xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={faq._id} className="rounded shadow  transition-all">
              {/* Question */}
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left cursor-pointer  px-4 py-3 rounded-t-xl flex justify-between items-center"
              >
                <span className="font-semibold text-base text-gray-800">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div
                  className="bg-white px-4 py-3 rounded-b-xl border-t border-gray-200"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(faq.answer),
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FAQSection;

import React, { useState } from "react";

const ProductFAQ = ({ faq = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!faq || faq.length === 0) return null;

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4  primaryTextColor">
          FAQs
        </h2>
        <div className="space-y-4 text-gray-100">
          {faq.map((item, index) => (
            <div
              key={item._id || index}
              className="border primaryBorderColor rounded-lg"
            >
              <button
                className="w-full text-left px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none"
                onClick={() => toggle(index)}
              >
                <span className="text-lg  primaryTextColor font-medium">
                  {item.question}
                </span>
                <span className="text-2xl text-[#EF6C00]">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden px-4 ${
                  activeIndex === index ? "max-h-screen py-2" : "max-h-0"
                }`}
              >
                <p className="secondaryTextColor whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFAQ;

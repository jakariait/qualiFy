import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

const ProductFAQ = ({ faq = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!faq || faq.length === 0) return null;

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 mt-10 primaryTextColor">
          FAQs
        </h2>
        <div className="space-y-4">
          {faq.map((item, index) => (
            <Accordion
              key={item._id || index}
              expanded={activeIndex === index}
              onChange={() => toggle(index)}
              sx={{
                backgroundColor: "transparent",
                border: "1px solid #EF6C00",
                borderRadius: "5px",
                boxShadow: "none",
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  margin: "16px 0",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ChevronDown className="h-6 w-6 text-[#EF6C00]" />}
                aria-controls={`panel${index}a-content`}
                id={`panel${index}a-header`}
              >
                <span className="text-lg primaryTextColor font-medium">
                  {item.question}
                </span>
              </AccordionSummary>
              <AccordionDetails>
                <p className="secondaryTextColor whitespace-pre-line">
                  {item.answer}
                </p>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFAQ;
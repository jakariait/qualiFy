import React, { useState } from "react";
import GeneralInfoStore from "../../store/GeneralInfoStore.js";
import { Link } from "react-router-dom";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import NewsletterForm from "./NewsletterForm.jsx";
import SocialMedia from "./SocialMedia.jsx";
import Skeleton from "react-loading-skeleton";
import ImageComponent from "./ImageComponent.jsx";

const Footer = () => {
  const { GeneralInfoList, GeneralInfoListLoading, GeneralInfoListError } =
    GeneralInfoStore();

  if (GeneralInfoListError) {
    return (
      <div className="primaryTextColor container md:mx-auto text-center p-3">
        <h1 className="p-20">Something went wrong! Please try again later.</h1>
      </div>
    );
  }

  return (
    <div>
      {GeneralInfoListLoading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:container xl:mx-auto p-3">
            <Skeleton height={200} width="100%" />
            <Skeleton height={200} width="100%" />
            <Skeleton height={200} width="100%" />
            <Skeleton height={200} width="100%" />
          </div>
          <Skeleton height={40} width="100%" />
        </>
      ) : (
        <div className="secondaryBgColor accentTextColor">
          {/* Mobile Footer */}
          <div className="lg:hidden px-0 py-3">
            {/* About Us */}
            <Accordion
              defaultExpanded
              style={{
                background: "transparent",
                boxShadow: "none",
                width: "100%",
                color: "white",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-white" />}
                aria-controls="panel1a-content"
              >
                <Typography>About Us</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div>
                  <Link to="/">
                    <ImageComponent
                      imageName={GeneralInfoList?.PrimaryLogo}
                      className="w-20 md:w-30 "
                    />
                  </Link>
                  <p className={"mt-5"}>{GeneralInfoList?.ShortDescription}</p>
                  <h1 className="mb-3 mt-3">Follow Us</h1>
                  <SocialMedia />
                </div>
              </AccordionDetails>
            </Accordion>

            {/* Quick Links */}
            <Accordion
              style={{
                background: "transparent",
                boxShadow: "none",
                width: "100%",
                color: "white",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-white" />}
                aria-controls="panel3a-content"
              >
                <Typography>Quick Links</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ul>
                  <li className="hover:primaryTextColor">
                    <Link to="/about">About</Link>
                  </li>
                  <li className="hover:primaryTextColor">Blog</li>
                  <li className="hover:primaryTextColor">
                    <Link to="/contact-us">Contact</Link>
                  </li>
                  <li className="hover:primaryTextColor">
                    <Link to="/termofservice">Terms of Services</Link>
                  </li>
                  <li className="hover:primaryTextColor">
                    <Link to="/privacypolicy">Privacy Policy</Link>
                  </li>
                  <li className="hover:primaryTextColor">
                    <Link to="/refundpolicy">Refund Policy</Link>
                  </li>
                  <li className="hover:primaryTextColor">
                    <Link to="/shippinpolicy">Shipping Policy</Link>
                  </li>
                  <li className="hover:primaryTextColor">
                    <Link to="/faqs">FAQ</Link>
                  </li>
                  <li className="hover:primaryTextColor">
                    <Link to="/track-order">Track Your Order</Link>
                  </li>
                </ul>
              </AccordionDetails>
            </Accordion>

            {/* Newsletter */}
            <Accordion
              style={{
                background: "transparent",
                boxShadow: "none",
                width: "100%",
                color: "white",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-white" />}
                aria-controls="panel5a-content"
              >
                <Typography>Newsletter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <h1>
                  Take advantage of our special offer. Do not worry, we would
                  not spam you.
                </h1>
                <NewsletterForm />
              </AccordionDetails>
            </Accordion>
          </div>

          {/* Desktop Footer */}
          <div className="hidden xl:container xl:mx-auto lg:grid lg:grid-cols-12 gap-10 py-10 px-6">
            <div className="col-span-5 relative">
              <h1 className="mb-3">
                About Us
                <span className="absolute left-0 top-6 w-15 border-b-2 border-gray-300 mt-1"></span>
              </h1>
              <Link to="/">
                <ImageComponent
                  imageName={GeneralInfoList?.PrimaryLogo}
                  className="w-20 md:w-30 "
                  skeletonHeight={100}
                  showSkeleton={false}
                />
              </Link>
              <p className={"mt-5"}>{GeneralInfoList?.ShortDescription}</p>
              <h1 className="mb-3 mt-3">Follow Us</h1>
              <SocialMedia />
            </div>

            <div className="col-span-4 relative">
              <h1 className="mb-3">
                Quick Links
                <span className="absolute left-0 top-6 w-15 border-b-2 border-gray-300 mt-1"></span>
              </h1>
              <ul>
                <li className="hover:primaryTextColor">
                  <Link to="/about">About</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/blog">Blog</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/contact-us">Contact</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/termofservice">Terms of Services</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/privacypolicy">Privacy Policy</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/refundpolicy">Refund Policy</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/shippinpolicy">Shipping Policy</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/track-order">Track Your Order</Link>
                </li>
                <li className="hover:primaryTextColor">
                  <Link to="/faqs">FAQ</Link>
                </li>
              </ul>
            </div>

            <div className="col-span-3 relative">
              <h1 className="mb-3">
                Newsletters
                <span className="absolute left-0 top-6 w-15 border-b-2 border-gray-200 mt-1"></span>
              </h1>
              <p>
                Take advantage of our special offer. Do not worry, we would not
                spam you
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="text-center pb-5 pt-5 flex flex-col md:flex-row items-center justify-center gap-3">
            <p>{GeneralInfoList?.FooterCopyright}</p>
            <p>
              Design and Developed by{" "}
              <a
                href="https://www.digiweb.digital/"
                className="text-red-500 hover:underline"
              >
                DigiWeb
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer;

import {
  FaHome,
  FaPalette,
  FaLink,
  FaSearch,
  FaCog,
  FaThLarge,
  FaTags,
  FaCreditCard,
  FaUsers,
  FaEnvelope,
  FaUserFriends,
  FaSlidersH,
  FaFileAlt,
  FaQuestionCircle,
  FaUserShield,
  FaSignOutAlt,
  FaShoppingBag,
  FaInfo,
  FaBlog,
  FaComments,
  FaChalkboardTeacher,
  FaArchive,
  FaClipboardCheck,
  FaInfoCircle,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import { useNavigate } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import React from "react";
import RequirePermission from "./RequirePermission.jsx";

import { CircularProgress } from "@mui/material";

export default function SidebarMenu() {
  const { logout } = useAuthAdminStore();
  const { loading } = useAuthAdminStore();

  const navigate = useNavigate();
  // Logout function to clear the admin state and navigate to login
  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="w-64 mt-100 flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="w-fit p-4 h-screen overflow-y-auto ">
      {/* Dashboard */}
      <ul>
        <RequirePermission permission="dashboard" fallback={true}>
          <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
            <Link to="/admin/dashboard" className={"flex items-center gap-2"}>
              <FaHome /> <span>Dashboard</span>
            </Link>
          </li>
        </RequirePermission>
      </ul>

      {/* Website Config */}
      <div>
        <ul className="space-y-1">
          <RequirePermission permission="student-review" fallback={true}>
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Link
                to="/admin/student-review"
                className={"flex items-center gap-2"}
              >
                <FaComments /> <span>Student Review</span>
              </Link>
            </li>
          </RequirePermission>

          <RequirePermission permission="instructor" fallback={true}>
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Link
                to="/admin/instructor"
                className={"flex items-center gap-2"}
              >
                <FaChalkboardTeacher /> <span>Instructor</span>
              </Link>
            </li>
          </RequirePermission>
          <RequirePermission permission="platform" fallback={true}>
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Link to="/admin/platform" className={"flex items-center gap-2"}>
                <FaEnvelope /> <span>Platform Info</span>
              </Link>
            </li>
          </RequirePermission>

          <RequirePermission permission="exam" fallback={true}>
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Link to="/admin/exams" className={"flex items-center gap-2"}>
                <FaClipboardCheck /> <span>Exam Management</span>
              </Link>
            </li>
          </RequirePermission>

          <RequirePermission permission="notice" fallback={true}>
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Link to="/admin/notice" className={"flex items-center gap-2"}>
                <FaInfoCircle /> <span>Notice Management</span>
              </Link>
            </li>
          </RequirePermission>

          <RequirePermission permission="website_theme_color" fallback={true}>
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Link
                to="/admin/general-info"
                className={"flex items-center gap-2"}
              >
                <FaThLarge /> <span>General Info</span>
              </Link>
            </li>
          </RequirePermission>

          <RequirePermission permission="general_info" fallback={true}>
            <Link to="/admin/color-updater/">
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <FaPalette /> <span>Website Theme Color</span>
              </li>
            </Link>
          </RequirePermission>
          <RequirePermission permission="website_theme_color" fallback={true}>
            <Link to="/admin/social-link-updater">
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <FaLink /> <span>Social Media Links</span>
              </li>
            </Link>
          </RequirePermission>
          <RequirePermission permission="home_page_seo" fallback={true}>
            <Link to="/admin/homepage-seo">
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <FaSearch /> <span>Home Page SEO</span>
              </li>
            </Link>
          </RequirePermission>
        </ul>
        <RequirePermission permission="product_service" fallback={true}>
          <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
            <Link
              to="/admin/product-service"
              className={"flex items-center gap-2"}
            >
              <FaTags /> <span>Manage Products & Service</span>
            </Link>
          </li>
        </RequirePermission>

        <RequirePermission permission="product_service" fallback={true}>
          <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
            <Link
              to="/admin/free-resource"
              className={"flex items-center gap-2"}
            >
              <FaArchive /> <span>Manage Free Resources</span>
            </Link>
          </li>
        </RequirePermission>

        <RequirePermission permission="free_class" fallback={true}>
          <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
            <Link to="/admin/free-class" className={"flex items-center gap-2"}>
              <FaArchive /> <span>Manage Free Class</span>
            </Link>
          </li>
        </RequirePermission>
      </div>

      {/* E-Commerce Modules */}
      <div>
        <ul className="space-y-1">
          <RequirePermission
            permission={[
              "setup_config",
              "product_size",
              "product_flag",
              "scroll_text",
              "delivery_charges",
              "manage_coupons",
            ]}
            match="any"
            fallback={true}
          >
            <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
              <Accordion
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  width: "100%",
                }}
                sx={{
                  color: "white", // Ensures text color is white
                  "& .MuiAccordionSummary-root": {
                    backgroundColor: "transparent",
                    minHeight: "auto", // Removes unnecessary padding
                    padding: "0", // Removes default padding
                  },
                  "& .MuiAccordionDetails-root": {
                    backgroundColor: "transparent",
                    paddingLeft: "0", // Ensures no extra left padding
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white", // Ensures the dropdown icon is white
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="p-2 flex items-center"
                >
                  <Typography component="span">
                    <div className="flex items-center gap-2">
                      <FaCog /> <span>Config</span>
                    </div>
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <ul className={"space-y-2 pl-4"}>
                    <RequirePermission permission="scroll_text" fallback={true}>
                      <li>
                        <Link to="/admin/scroll-text">Scroll Text</Link>
                      </li>
                    </RequirePermission>
                    <RequirePermission
                      permission="setup_config"
                      fallback={true}
                    >
                      <li>
                        <Link to="/admin/configsetup">Setup Your Config</Link>
                      </li>
                    </RequirePermission>
                    <RequirePermission
                      permission="delivery_charges"
                      fallback={true}
                    >
                      <li>
                        <Link to="/admin/deliverycharge">
                          <span>Delivery Charges</span>
                        </Link>
                      </li>
                    </RequirePermission>
                    <RequirePermission
                      permission="manage_coupons"
                      fallback={true}
                    >
                      <li>
                        <Link to="/admin/coupon">
                          <span>Coupon</span>
                        </Link>
                      </li>
                    </RequirePermission>
                  </ul>
                </AccordionDetails>
              </Accordion>
            </li>
          </RequirePermission>

          <RequirePermission permission="view_orders" fallback={true}>
            <li className="space-x-2 px-2 rounded-md cursor-pointer">
              <Accordion
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  width: "100%",
                }}
                sx={{
                  color: "white", // Ensures text color is white
                  "& .MuiAccordionSummary-root": {
                    backgroundColor: "transparent",
                    minHeight: "auto", // Removes unnecessary padding
                    padding: "0", // Removes default padding
                  },
                  "& .MuiAccordionDetails-root": {
                    backgroundColor: "transparent",
                    paddingLeft: "0", // Ensures no extra left padding
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white", // Ensures the dropdown icon is white
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="p-2 flex items-center"
                >
                  <Typography component="span">
                    <div className="flex items-center gap-2">
                      <FaShoppingBag /> <span>Manage Orders</span>
                    </div>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul className={"space-y-2 pl-4"}>
                    <li>
                      <Link to="/admin/allorders">All Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/pendingorders">Pending Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/approvedorders">Approved Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/intransitorders">In Transit Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/deliveredorders">Delivered Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/returnedorders">Returned Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/cancelledorders">Cancelled Orders</Link>
                    </li>
                  </ul>
                </AccordionDetails>
              </Accordion>
            </li>
          </RequirePermission>

          <RequirePermission
            permission={["bkash_api"]}
            match="any"
            fallback={true}
          >
            <li className="space-x-2 px-2 rounded-md cursor-pointer">
              <Accordion
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  width: "100%",
                }}
                sx={{
                  color: "white", // Ensures text color is white
                  "& .MuiAccordionSummary-root": {
                    backgroundColor: "transparent",
                    minHeight: "auto", // Removes unnecessary padding
                    padding: "0", // Removes default padding
                  },
                  "& .MuiAccordionDetails-root": {
                    backgroundColor: "transparent",
                    paddingLeft: "0", // Ensures no extra left padding
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white", // Ensures the dropdown icon is white
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="p-2 flex items-center"
                >
                  <Typography component="span">
                    <div className="flex items-center gap-2">
                      <FaCreditCard /> <span>Gateway & API</span>
                    </div>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul className={"space-y-2 pl-4"}>
                    <RequirePermission permission="bkash_api" fallback={true}>
                      <li>
                        <Link
                          to="/admin/bkash-config"
                          className={"flex items-center gap-2"}
                        >
                          <span>bKash</span>
                        </Link>
                      </li>
                    </RequirePermission>
                  </ul>
                </AccordionDetails>
              </Accordion>
            </li>
          </RequirePermission>

          <RequirePermission permission="view_customers" fallback={true}>
            <li>
              <Link
                to="/admin/customers"
                className="flex items-center space-x-2 p-2 rounded-md cursor-pointer"
              >
                <FaUsers /> <span>Customers</span>
              </Link>
            </li>
          </RequirePermission>
        </ul>
      </div>

      {/* Other Sections */}
      <div>
        <ul>
          <RequirePermission permission="contact_request" fallback={true}>
            <Link to="/admin/contact-request">
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <FaEnvelope /> <span>Contact Request</span>
              </li>
            </Link>
          </RequirePermission>
          <RequirePermission permission="subscribed_users" fallback={true}>
            <Link to="/admin/subscribed-users">
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <FaUserFriends /> <span>Subscribed Users</span>
              </li>
            </Link>
          </RequirePermission>
          <RequirePermission permission="blogs" fallback={true}>
            <Link to="/admin/blogs">
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <FaBlog /> <span>Blogs</span>
              </li>
            </Link>
          </RequirePermission>
        </ul>
      </div>

      <div>
        <ul>
          {[
            {
              icon: <FaSlidersH />,
              label: "Sliders & Banners",
              to: "/admin/sliders-banners",
              permission: "sliders-banners",
            },
            {
              icon: <FaFileAlt />,
              label: "Terms & Policies",
              to: "/admin/terms-policies",
              permission: "about_terms-policies",
            },
            {
              icon: <FaQuestionCircle />,
              label: "FAQs",
              to: "/admin/faqs",
              permission: "faqs",
            },
            {
              icon: <FaInfo />,
              label: "About Us",
              to: "/admin/about-us",
              permission: "about_terms-policies",
            },
          ].map((item, index) => (
            <RequirePermission
              key={index}
              permission={item.permission}
              fallback={true}
            >
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                {item.to ? (
                  <Link
                    to={item.to}
                    className="flex items-center space-x-2 w-full"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    {item.icon}
                    <span>{item.label}</span>
                  </>
                )}
              </li>
            </RequirePermission>
          ))}
        </ul>
      </div>

      <div>
        <ul>
          {[
            {
              icon: <FaUserShield />,
              label: "System Users",
              path: "/admin/adminlist",
              permission: "admin-users", // 👈 Add permission key here
            },
          ].map((item, index) => (
            <RequirePermission
              key={index}
              permission={item.permission}
              fallback={true} // or a skeleton <li> if you want a loading placeholder
            >
              <li className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                {item.icon}
                <Link to={item.path} className="text-inherit no-underline">
                  {item.label}
                </Link>
              </li>
            </RequirePermission>
          ))}
        </ul>
      </div>

      {/* Logout and Others */}
      <div>
        <ul>
          <li className="flex items-center space-x-2 p-2  rounded-md accentTextColor cursor-pointer">
            <button
              onClick={handleLogout}
              className={"flex items-center space-x-2 cursor-pointer"}
            >
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

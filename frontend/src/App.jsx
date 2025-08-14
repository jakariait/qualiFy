import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GeneralInfoPage from "./pagesAdmin/GeneralInfoPage.jsx";
import HomePage from "./pagesUser/HomePage.jsx";
import SubscribedUsersPage from "./pagesAdmin/SubscribedUsersPage.jsx";
import SliderBannerPage from "./pagesAdmin/SliderBannerPage.jsx";
import useColorStore from "./store/ColorStore.js";
import { useEffect } from "react";
import ColorUpdaterPage from "./pagesAdmin/ColorUpdaterPage.jsx";
import SocialLinkUpdaterPage from "./pagesAdmin/SocialLinkUpdaterPage.jsx";
import ContactUsPage from "./pagesUser/ContactUsPage.jsx";
import GeneralInfoStore from "./store/GeneralInfoStore.js";
import CarouselStore from "./store/CarouselStore.js";
import FeatureStore from "./store/FeatureStore.js";
import useSocialMediaLinkStore from "./store/SocialMediaLinkStore.js";
import useAuthUserStore from "./store/AuthUserStore.js";
import ContactRequestPage from "./pagesAdmin/ContactRequestPage.jsx";
import AdminLogin from "./component/componentAdmin/AdminLogin.jsx";
import ProtectedRoute from "./component/componentAdmin/ProtectedRoute.jsx";
import NotFoundPage from "./pagesUser/NotFoundPage.jsx";
import ProductDetailsPage from "./pagesUser/ProductDetailsPage.jsx";
import LoginPage from "./pagesUser/LoginPage.jsx";
import RegisterPage from "./pagesUser/RegisterPage.jsx";
import CustomerListPage from "./pagesAdmin/CustomerListPage.jsx";
import UserProtectedRoute from "./component/componentGeneral/UserProtectedRoute.jsx";
import UserHomePage from "./pagesUser/UserHomePage.jsx";
import CheckoutPage from "./pagesUser/CheckoutPage.jsx";
import DeliveryChargePage from "./pagesAdmin/DeliveryChargePage.jsx";
import ConfigSetupPage from "./pagesAdmin/ConfigSetupPage.jsx";
import ThankYouPage from "./pagesUser/ThankYouPage.jsx";
import AllOrdersPage from "./pagesAdmin/AllOrdersPage.jsx";
import PendingOrdersPage from "./pagesAdmin/PendingOrdersPage.jsx";
import ApprovedOrdersPage from "./pagesAdmin/ApprovedOrdersPage.jsx";
import InTransitOrdersPage from "./pagesAdmin/InTransitOrdersPage.jsx";
import DeliveredOrdersPage from "./pagesAdmin/DeliveredOrdersPage.jsx";
import ReturnedOrdersPage from "./pagesAdmin/ReturnedOrdersPage.jsx";
import CancelledOrdersPage from "./pagesAdmin/CancelledOrdersPage.jsx";
import ViewOrderPage from "./pagesAdmin/ViewOrderPage.jsx";
import BkashCallbackPage from "./pagesUser/BkashCallbackPage.jsx";
import CouponPage from "./pagesAdmin/CouponPage.jsx";
import ScrollToTop from "./component/componentGeneral/ScrollToTop.jsx";
import AboutUsPage from "./pagesAdmin/AboutUsPage.jsx";
import TermsPage from "./pagesAdmin/TermsPage.jsx";
import AboutUsPageUser from "./pagesUser/AboutUsPageUser.jsx";
import TosPage from "./pagesUser/TosPage.jsx";
import PrivacyPolicyPage from "./pagesUser/PrivacyPolicyPage.jsx";
import RefundPolicyPage from "./pagesUser/RefundPolicyPage.jsx";
import ShippingPolicyPage from "./pagesUser/ShippingPolicyPage.jsx";
import FAQPage from "./pagesUser/FAQPage.jsx";
import AdminFAQSPage from "./pagesAdmin/AdminFAQSPage.jsx";
import MarqueeAdminPage from "./pagesAdmin/MarqueeAdminPage.jsx";
import AdminMetaPage from "./pagesAdmin/AdminMetaPage.jsx";
import MetaProvider from "./component/componentGeneral/MetaProvider.jsx";
import BKashConfigPage from "./pagesAdmin/BKashConfigPage.jsx";
import ScrollToTopButton from "./component/componentGeneral/ScrollToTopButton.jsx";
import DashboardPage from "./pagesAdmin/DashboardPage.jsx";
import UserAllOrdersPage from "./pagesUser/UserAllOrdersPage.jsx";
import UserOrderDetailsPage from "./pagesUser/UserOrderDetailsPage.jsx";
import UpdateUserPage from "./pagesUser/UpdateUserPage.jsx";
import ChangePasswordPage from "./pagesUser/ChangePasswordPage.jsx";
import TrackOrderPage from "./pagesUser/TrackOrderPage.jsx";
import AdminListPage from "./pagesAdmin/AdminListPage.jsx";
import CreateAdminPage from "./pagesAdmin/CreateAdminPage.jsx";
import EditAdminPage from "./pagesAdmin/EditAdminPage.jsx";
import { setFaviconFromApi } from "./utils/setFavicon.js";
import CreateBlogPage from "./pagesAdmin/CreateBlogPage.jsx";
import BlogsListPage from "./pagesAdmin/BlogsListPage.jsx";
import EditBlogPage from "./pagesAdmin/EditBlogPage.jsx";
import BlogsPage from "./pagesUser/BlogsPage.jsx";
import BlogDetailsPage from "./pagesUser/BlogDetailsPage.jsx";
import ForgetPasswordPage from "./pagesUser/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./pagesUser/ResetPasswordPage.jsx";
import AllCoursesPage from "./pagesUser/AllCoursesPage.jsx";
import AllBooksPage from "./pagesUser/AllBooksPage.jsx";
import StudentReviewPage from "./pagesAdmin/StudentReviewPage.jsx";
import InstructorInfoPage from "./pagesAdmin/InstructorInfoPage.jsx";
import ManageProductServicePage from "./pagesAdmin/ManageProductServicePage.jsx";
import AllLiveExamPage from "./pagesUser/AllLiveExamPage.jsx";
import FreeResourceUploadPage from "./pagesAdmin/FreeResourceUploadPage.jsx";
import AllFreeResourcesPage from "./pagesUser/AllFreeResourcesPage.jsx";
import ResourceViewerPage from "./pagesUser/ResourceViewerPage.jsx";
import PlatformInfoPage from "./pagesAdmin/PlatformInfoPage.jsx";
import FreeClassPage from "./pagesAdmin/FreeClassPage.jsx";
import ViewAllClassPage from "./pagesUser/ViewAllClassPage.jsx";
import ExamListPage from "./pagesAdmin/ExamListPage.jsx";
import CreateExamPage from "./pagesAdmin/CreateExamPage.jsx";
import EditExamPage from "./pagesAdmin/EditExamPage.jsx";

function App() {
  const { GeneralInfoListRequest, GeneralInfoList } = GeneralInfoStore();
  const { CarouselStoreListRequest } = CarouselStore();
  const { FeatureStoreListRequest } = FeatureStore();
  const { fetchColors, colors } = useColorStore(); // ✅ Extract colors
  const { fetchSocialMediaLinks } = useSocialMediaLinkStore();
  const { initialize } = useAuthUserStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          GeneralInfoListRequest(),
          CarouselStoreListRequest(),
          FeatureStoreListRequest(),
          fetchColors(),
          fetchSocialMediaLinks(),
          initialize(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // ✅ Empty dependency array to prevent unnecessary re-renders

  useEffect(() => {
    if (colors) {
      document.documentElement.style.setProperty(
        "--primaryColor",
        colors.primaryColor,
      );
      document.documentElement.style.setProperty(
        "--secondaryColor",
        colors.secondaryColor,
      );
      document.documentElement.style.setProperty(
        "--tertiaryColor",
        colors.tertiaryColor,
      );
      document.documentElement.style.setProperty(
        "--accentColor",
        colors.accentColor,
      );
    }
  }, [colors]); // ✅ This effect will run only when colors change

  setFaviconFromApi(GeneralInfoList?.Favicon); // Favicon

  return (
    <Router>
      <MetaProvider />
      <ScrollToTop />
      <ScrollToTopButton />
      <Routes>
        {/* General User Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<AllCoursesPage />} />
        <Route path="/books" element={<AllBooksPage />} />
        <Route path="/live-exam" element={<AllLiveExamPage />} />
        <Route path="/free-resources" element={<AllFreeResourcesPage />} />
        <Route path="/free-class" element={<ViewAllClassPage />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
        <Route path="/bkash-callback" element={<BkashCallbackPage />} />
        <Route path="/about" element={<AboutUsPageUser />} />
        <Route path="/termofservice" element={<TosPage />} />
        <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
        <Route path="/refundpolicy" element={<RefundPolicyPage />} />
        <Route path="/shippinpolicy" element={<ShippingPolicyPage />} />
        <Route path="/faqs" element={<FAQPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/blog" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailsPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/*Admin Login Page*/}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected User Routes */}
        <Route element={<UserProtectedRoute />}>
          <Route path="/resource-viewer/:id" element={<ResourceViewerPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route path="/user/home" element={<UserHomePage />} />
          <Route path="/user/orders" element={<UserAllOrdersPage />} />
          <Route
            path="/user/orders/:orderNo"
            element={<UserOrderDetailsPage />}
          />
          <Route path="/user/manage-profile" element={<UpdateUserPage />} />
          <Route
            path="/user/change-password"
            element={<ChangePasswordPage />}
          />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/general-info" element={<GeneralInfoPage />} />
          <Route path="/admin/student-review" element={<StudentReviewPage />} />
          <Route path="/admin/instructor" element={<InstructorInfoPage />} />
          <Route
            path="/admin/product-service"
            element={<ManageProductServicePage />}
          />
          <Route
            path="/admin/free-resource"
            element={<FreeResourceUploadPage />}
          />
          <Route path="/admin/exams" element={<ExamListPage />} />
          <Route path="/admin/exams/create" element={<CreateExamPage />} />
          <Route path="/admin/exams/edit/:id" element={<EditExamPage />} />

          <Route path="/admin/platform" element={<PlatformInfoPage />} />
          <Route
            path="/admin/subscribed-users"
            element={<SubscribedUsersPage />}
          />
          <Route path="/admin/color-updater" element={<ColorUpdaterPage />} />
          <Route
            path="/admin/social-link-updater"
            element={<SocialLinkUpdaterPage />}
          />
          <Route path="/admin/sliders-banners" element={<SliderBannerPage />} />
          <Route path="/admin/free-class" element={<FreeClassPage />} />

          <Route
            path="/admin/contact-request"
            element={<ContactRequestPage />}
          />

          {/* Product Routes */}

          <Route path="/admin/customers" element={<CustomerListPage />} />
          {/*Delivery Charges Routes*/}
          <Route
            path="/admin/deliverycharge"
            element={<DeliveryChargePage />}
          />

          <Route path="/admin/configsetup" element={<ConfigSetupPage />} />

          {/*Orders Routes*/}
          <Route path="/admin/allorders" element={<AllOrdersPage />} />
          <Route path="/admin/pendingorders" element={<PendingOrdersPage />} />
          <Route
            path="/admin/approvedorders"
            element={<ApprovedOrdersPage />}
          />
          <Route
            path="/admin/intransitorders"
            element={<InTransitOrdersPage />}
          />

          <Route
            path="/admin/deliveredorders"
            element={<DeliveredOrdersPage />}
          />
          <Route
            path="/admin/returnedorders"
            element={<ReturnedOrdersPage />}
          />
          <Route
            path="/admin/cancelledorders"
            element={<CancelledOrdersPage />}
          />

          <Route path="/admin/orders/:orderId" element={<ViewOrderPage />} />

          <Route path="/admin/coupon" element={<CouponPage />} />
          <Route path="/admin/about-us" element={<AboutUsPage />} />
          <Route path="/admin/terms-policies" element={<TermsPage />} />
          <Route path="/admin/faqs" element={<AdminFAQSPage />} />
          <Route path="/admin/scroll-text" element={<MarqueeAdminPage />} />
          <Route path="/admin/homepage-seo" element={<AdminMetaPage />} />
          <Route path="/admin/bkash-config" element={<BKashConfigPage />} />

          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/adminlist" element={<AdminListPage />} />
          <Route path="/admin/createadmin" element={<CreateAdminPage />} />
          <Route path="/admin/edit/:id" element={<EditAdminPage />} />

          <Route path="/admin/create-blog" element={<CreateBlogPage />} />

          <Route path="/admin/blogs" element={<BlogsListPage />} />

          <Route path="/admin/blogs/:id" element={<EditBlogPage />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

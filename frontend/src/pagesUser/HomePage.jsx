import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";
import ProductCarousel from "../component/componentGeneral/ProductCarousel.jsx";
import Feature from "../component/componentGeneral/Feature.jsx";
import UniversityPrepHeroSection from "../component/componentGeneral/UniversityPrepHeroSection.jsx";
import AnimatedScrollableTeachers from "../component/componentGeneral/AnimatedScrollableTeachers.jsx";
import AnimatedScrollableStudentReviews from "../component/componentGeneral/AnimatedScrollableStudentReviews.jsx";
import AllCourses from "../component/componentGeneral/AllCourses.jsx";
import AllBooks from "../component/componentGeneral/AllBooks.jsx";
import AllLiveExam from "../component/componentGeneral/AllLiveExam.jsx";
import FreeClassVideos from "../component/componentGeneral/FreeClassVideos.jsx";

const HomePage = () => {
  return (
    <Layout>
      <ProductCarousel />
      <UniversityPrepHeroSection />
      <Feature />
      <AllCourses limit={3} showViewAll />
      <AllBooks limit={3} showViewAll />
      <AllLiveExam limit={3} showViewAll />
      <FreeClassVideos limit={4} showViewAll={true} />
      <AnimatedScrollableStudentReviews />
      <AnimatedScrollableTeachers />
    </Layout>
  );
};

export default HomePage;

import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";
import ProductCarousel from "../component/componentGeneral/ProductCarousel.jsx";
import Feature from "../component/componentGeneral/Feature.jsx";
import UniversityPrepHeroSection from "../component/componentGeneral/UniversityPrepHeroSection.jsx";
import AnimatedScrollableTeachers from "../component/componentGeneral/AnimatedScrollableTeachers.jsx";
import AnimatedScrollableStudentReviews from "../component/componentGeneral/AnimatedScrollableStudentReviews.jsx";
import AllCourses from "../component/componentGeneral/AllCourses.jsx";

const HomePage = () => {
  return (
    <Layout>
      <ProductCarousel />
      <UniversityPrepHeroSection />
      <Feature />
      <AnimatedScrollableStudentReviews />
      <AnimatedScrollableTeachers />
      <AllCourses/>
    </Layout>
  );
};

export default HomePage;

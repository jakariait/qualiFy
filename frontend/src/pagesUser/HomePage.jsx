import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";
import ProductCarousel from "../component/componentGeneral/ProductCarousel.jsx";
import Feature from "../component/componentGeneral/Feature.jsx";
import UniversityPrepHeroSection from "../component/componentGeneral/UniversityPrepHeroSection.jsx";
import AnimatedScrollableTeachers from "../component/componentGeneral/AnimatedScrollableTeachers.jsx";
import AnimatedScrollableStudentReviews from "../component/componentGeneral/AnimatedScrollableStudentReviews.jsx";

const HomePage = () => {
  return (
    <Layout>
      <ProductCarousel />
      <UniversityPrepHeroSection />
      <Feature />
      <AnimatedScrollableStudentReviews />
      <AnimatedScrollableTeachers />
    </Layout>
  );
};

export default HomePage;

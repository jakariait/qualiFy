import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";
import ProductCarousel from "../component/componentGeneral/ProductCarousel.jsx";
import Feature from "../component/componentGeneral/Feature.jsx";
import ProductByFlag from "../component/componentGeneral/ProductByFlag.jsx";
import UniversityPrepHeroSection from "../component/componentGeneral/UniversityPrepHeroSection.jsx";

const HomePage = () => {
  return (
    <Layout>
      <ProductCarousel />
      <UniversityPrepHeroSection />
      <Feature />
      {/*<ProductByFlag/>*/}
    </Layout>
  );
};

export default HomePage;

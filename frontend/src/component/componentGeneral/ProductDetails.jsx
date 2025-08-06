import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useProductStore from "../../store/useProductStore.js";
import GeneralInfoStore from "../../store/GeneralInfoStore.js";
import Skeleton from "react-loading-skeleton";
import { Helmet } from "react-helmet";
import ProductAddToCart from "./ProductAddToCart.jsx";
import SimilarProducts from "./SimilarProducts.jsx";
import FAQSection from "./FAQSection.jsx";
import ProductFAQ from "./ProductFAQ.jsx";

const ProductDetails = () => {
  const hasPushedRef = useRef(false);
  const { fetchProductBySlug, product, loading, error, resetProduct } =
    useProductStore();
  const { GeneralInfoList } = GeneralInfoStore();
  const { slug } = useParams();

  const [currentProductSlug, setCurrentProductSlug] = useState(null);

  useEffect(() => {
    if (slug !== currentProductSlug) {
      resetProduct();
      setCurrentProductSlug(slug);
      fetchProductBySlug(slug);
    }
  }, [slug, currentProductSlug, fetchProductBySlug, resetProduct]);

  const calculateDiscountPercentage = (priceBefore, priceAfter) => {
    if (!priceBefore || !priceAfter || priceBefore <= priceAfter) return 0;
    return Math.ceil(((priceBefore - priceAfter) / priceBefore) * 100);
  };

  const discountPercentage =
    product?.finalPrice && product?.finalDiscount
      ? calculateDiscountPercentage(product.finalPrice, product.finalDiscount)
      : 0;

  useEffect(() => {
    if (!product || hasPushedRef.current) return;

    const price =
      product.finalDiscount > 0 ? product.finalDiscount : product.finalPrice;
    const discount =
      product.finalDiscount > 0
        ? product.finalPrice - product.finalDiscount
        : 0;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        currency: "BDT",
        value: price,
        items: [
          {
            item_id: product.productId,
            item_name: product.name,
            currency: "BDT",
            discount,
            item_variant: "Default",
            price,
            quantity: 1,
          },
        ],
      },
    });

    hasPushedRef.current = true;
  }, [product]);

  if (loading || product?.slug !== slug) {
    return (
      <div className="xl:container xl:mx-auto p-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Skeleton height={650} width="100%" />
          </div>
          <div className="max-w-md w-full">
            <Skeleton height={50} width="90%" />
            <Skeleton height={50} width="80%" />
            <Skeleton height={50} width="90%" />
            <div className="grid grid-cols-3 gap-1">
              <Skeleton height={50} width="90%" />
              <Skeleton height={50} width="80%" />
              <Skeleton height={50} width="90%" />
            </div>
            <Skeleton height={50} width="90%" />
            <Skeleton height={50} width="50%" />
            <Skeleton height={50} width="40%" />
            <div className="grid grid-cols-2 gap-1">
              <Skeleton height={50} width="100%" />
              <Skeleton height={50} width="100%" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:container xl:mx-auto p-3">
      {error && (
        <div className="text-red-500 flex items-center justify-center pt-40">
          Error: {error}
        </div>
      )}

      {product && (
        <div>
          {/* SEO Meta Data */}
          <Helmet titleTemplate={`%s | ${GeneralInfoList?.CompanyName}`}>
            <html lang="en" />
            <meta name="robots" content="index, follow" />
            <title>{product?.name || product?.metaTitle}</title>
            <meta charSet="utf-8" />
            <meta name="description" content={product?.metaDescription} />
            <meta name="keywords" content={product.metaKeywords.join(", ")} />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta
              property="og:title"
              content={product?.name || product?.metaTitle}
            />
            <meta
              property="og:description"
              content={product?.metaDescription}
            />
            <meta property="og:image" content={product?.thumbnailImage} />
            <meta property="og:url" content={window.location.href} />
          </Helmet>

          <div className="flex flex-col md:flex-row pt-10 gap-8">
            {/* Left content - flex-grow */}
            <div className="flex-grow relative">
              {/* Add your product images, descriptions etc. here */}
              <ProductFAQ faq={product?.faqs} />
            </div>

            {/* Right sticky column with max-w-md */}
            <div
              className="w-full max-w-sm pt-4 md:pt-0 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="flex flex-col p-3 gap-3 bg-orange-200/50 rounded">
                <ProductAddToCart product={product} />
                {/* Additional content can go here */}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <SimilarProducts type={product?.type} productId={product?._id} />
      </div>
    </div>
  );
};

export default ProductDetails;

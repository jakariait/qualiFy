import React, { useState } from "react";
import { Typography, Skeleton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ImageComponent from "./ImageComponent.jsx";
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import useCartStore from "../../store/useCartStore.js";
import OrderCountBadge from "./OrderCountBadge.jsx";
import PrebookButton from "./PrebookButton.jsx";
import PrebookCountBadge from "./PrebookCountBadge.jsx";

const formatPrice = (price) => {
  if (isNaN(price)) return price;
  return price.toLocaleString();
};

const skeletonArray = Array.from({ length: 4 });

const ProductList = ({ products, loading }) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({}); // store quantity per product
  const MAX_QUANTITY = 5;

  const handleQuantityChange = (slug, type) => {
    setQuantities((prev) => {
      const current = prev[slug] || 1;
      let updated = current;
      if (type === "increase" && current < MAX_QUANTITY) updated = current + 1;
      if (type === "decrease" && current > 1) updated = current - 1;
      return { ...prev, [slug]: updated };
    });
  };

  const activeProducts = products.filter((product) => product.isActive);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {skeletonArray.map((_, idx) => (
          <div key={idx} className="p-2 rounded shadow">
            <Skeleton variant="rectangular" height={250} />
            <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {activeProducts.length === 0 ? (
        <Typography
          variant="body1"
          className="text-center text-gray-500 p-20 md:p-70 shadow rounded-lg"
        >
          No products found. Please check back later!
        </Typography>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {activeProducts.map((product) => {
            const quantity = quantities[product.slug] || 1;
            return (
              <div
                key={product.slug}
                className="relative shadow rounded-lg transition-transform transform hover:scale-[1.02] hover:shadow-lg duration-300"
              >
                <Link to={`/product/${product.slug}`}>
                  <ImageComponent
                    imageName={product.thumbnailImage}
                    altName={product.name}
                    skeletonHeight={250}
                  />
                </Link>

                <Link to={`/product/${product.slug}`}>
                  <div className="text-center heading primaryTextColor mt-2 mb-1 hover:underline">
                    {product.name}
                  </div>
                </Link>

                <div className="flex gap-2 justify-center">
                  {product.finalDiscount > 0 ? (
                    <>
                      <div className="line-through text-gray-500">
                        Tk. {formatPrice(product.finalPrice)}
                      </div>
                      <div className="text-red-800 font-semibold">
                        Tk. {formatPrice(product.finalDiscount)}
                      </div>
                    </>
                  ) : (
                    <div className="text-black font-semibold">
                      Tk. {formatPrice(product.finalPrice)}
                    </div>
                  )}
                </div>

                {/* Course info */}
                {product.type === "course" && (
                  <div className="mt-2 p-2 primaryTextColor flex flex-col items-center gap-1">
                    {product.isPreBooked && (
                      <div>
                        {product.enrolledStudents && (
                          <div className="flex items-center gap-1">
                            <PrebookCountBadge
                              productId={product._id}
                              prebook={product.bookingNumber}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {!product.isPreBooked && (
                      <div>
                        {product.enrolledStudents && (
                          <div className="flex items-center gap-1">
                            <OrderCountBadge
                              productId={product._id}
                              enrolledStudents={product.enrolledStudents}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {product.modelTest > 0 && (
                      <div className="flex items-center gap-1">
                        <ClipboardCheck className="w-4 h-4 text-purple-600" />
                        <span>Model Test: {product.modelTest}</span>
                      </div>
                    )}

                    {product.liveDoubtSolutionsSession > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span>
                          Live Doubt solving Session:{" "}
                          {product.liveDoubtSolutionsSession}
                        </span>
                      </div>
                    )}
                    {product.lessons && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span>Lessons: {product.lessons}</span>
                      </div>
                    )}
                    {product.classStartDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <span>Start Date: {product.classStartDate}</span>
                      </div>
                    )}
                  </div>
                )}

                {/*Book Specific Info*/}
                {product.type === "book" && (
                  <div className="primaryTextColor flex flex-col items-center gap-1 mt-3">
                    {product.isPreBooked && (
                      <div>
                        {product.enrolledStudents && (
                          <div className="flex items-center gap-1">
                            <PrebookCountBadge
                              productId={product._id}
                              prebook={product.bookingNumber}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {product.numberOfPages > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>Number of Pages: {product.numberOfPages}</span>
                      </div>
                    )}

                    {product.numberOfChapters > 0 && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span>
                          Number of Chapters: {product.numberOfChapters}
                        </span>
                      </div>
                    )}

                    {product.recommendedFor && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-purple-600" />
                        <span>Recommend For: {product.recommendedFor}</span>
                      </div>
                    )}
                  </div>
                )}

                {product.type === "exam" && (
                  <div
                    className={
                      "primaryTextColor flex flex-col items-center gap-1 mt-3"
                    }
                  >
                    {product.isPreBooked && (
                      <div>
                        <PrebookCountBadge
                          productId={product._id}
                          prebook={product.bookingNumber}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity & Buy Now Buttons */}
                <div className="flex flex-col gap-2 p-2">
                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full"
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      View Details
                    </button>

                    {/*Conditionally Render Buy Now and PreBook Button*/}

                    {product.isPreBooked ? (
                      <PrebookButton product={product} quantity={quantity} />
                    ) : (
                      <button
                        className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full"
                        onClick={() => {
                          addToCart(product, quantity);
                          navigate("/checkout");
                        }}
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;

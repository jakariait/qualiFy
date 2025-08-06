import React from "react";
import { Typography, Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent.jsx";
import { BookOpen, GraduationCap } from "lucide-react";

const formatPrice = (price) => {
  if (isNaN(price)) return price;
  return price.toLocaleString();
};

const skeletonArray = Array.from({ length: 4 });

const ProductList = ({ products, loading }) => {
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
          {activeProducts.map((product) => (
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

              {/*Only for course*/}
              {product.type === "course" && (
                <div className="mt-2 p-2 primaryTextColor flex flex-col items-center gap-1">
                  {/* Enrolled */}
                  {product.enrolledStudents && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Enrolled: {product.enrolledStudents}</span>
                    </div>
                  )}

                  {/* Lessons */}
                  {product.lessons && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span>Lessons: {product.lessons}</span>
                    </div>
                  )}
                </div>
              )}


              <Link to={`/product/${product.slug}`}>
                <div className="text-center primaryTextColor mt-2 mb-1 hover:underline">
                  {product.name}
                </div>
              </Link>

              <div className="flex gap-2 justify-center pb-3">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;

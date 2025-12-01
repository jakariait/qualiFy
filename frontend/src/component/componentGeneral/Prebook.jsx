import React from "react";
import { useLocation, Link } from "react-router-dom";
import CheckoutHeader from "./CheckoutHeader.jsx";
import useAuthUserStore from "../../store/AuthUserStore.js";
import ImageComponent from "./ImageComponent.jsx";

const Prebook = () => {
  const { user } = useAuthUserStore();
  const location = useLocation();
  const { product, quantity } = location.state || {};

  console.log(product);

  return (
    <div className="xl:container xl:mx-auto p-4">
      <CheckoutHeader user={user} page={"prebook"} />

      <div className="md:mt-10 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow ">
        {product ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <ImageComponent
                imageName={product.thumbnailImage}
                altName={product.name}
                className="w-full max-w-sm rounded-lg "
              />
            </div>

            {/* Product Info */}
            <div className="w-full md:w-1/2 flex justify-center gap-5 flex-col">
              <Link to={`/product/${product.slug}`}>
                <div className="text-2xl heading primaryTextColor  hover:underline">
                  {product.name}
                </div>
              </Link>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-600 ">Pre-Book Price</p>
                <p className="text-3xl font-semibold primaryTextColor mt-1">
                  Tk.
                  {product.finalDiscount > 0
                    ? product.finalDiscount
                    : product.finalPrice}
                </p>
              </div>

              {/* Product Details (optional placeholder) */}
              <p className="text-gray-600 text-sm leading-relaxed">
                Reserve early and take advantage of the limited-time discounted
                pre-book price.
              </p>

              {/* CTA Button */}
              <button className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full">
                Confirm Pre-Booking
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg mb-4">
              No product selected for pre-booking.
            </p>
            <Link
              to="/"
              className="primaryBgColor accentTextColor px-5 py-2 rounded-md"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prebook;

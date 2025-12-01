import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import CheckoutHeader from "./CheckoutHeader.jsx";
import useAuthUserStore from "../../store/AuthUserStore.js";
import ImageComponent from "./ImageComponent.jsx";

const Prebook = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const { user, token } = useAuthUserStore();
  const location = useLocation();
  const { product, quantity } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isPrebooked, setIsPrebooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${apiUrl}/pre-book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          productId: product._id,
          bookedPrice:
            product.finalDiscount > 0
              ? product.finalDiscount
              : product.finalPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsPrebooked(true);
      } else {
        setErrorMessage(data.message || "Pre-booking failed.");
      }
    } catch (error) {
      console.error("Error during pre-booking:", error);
      setErrorMessage("An error occurred during pre-booking.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toLocaleString();
  };

  return (
    <div className="xl:container xl:mx-auto p-4">
      <CheckoutHeader page={"prebook"} />

      <div className="md:mt-10 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow ">
        {errorMessage ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Pre-Booking Failed!
            </h2>
            <p className="text-gray-600 text-lg mb-4">{errorMessage}</p>
            <Link
              to="/"
              className="primaryBgColor accentTextColor px-5 py-2 rounded-md mt-6 inline-block"
            >
              Go to Home
            </Link>
          </div>
        ) : isPrebooked ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold primaryTextColor mb-4">
              Pre-Booking Successful!
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              You have successfully pre-booked the following product:
            </p>
            <div className="text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-lg font-semibold">{product.name}</p>
              <p className="text-gray-600">
                Booked at price: Tk.{" "}
                {product.finalDiscount > 0
                  ? product.finalDiscount
                  : product.finalPrice}
              </p>
            </div>
            <Link
              to="/"
              className="primaryBgColor accentTextColor px-5 py-2 rounded-md mt-6 inline-block"
            >
              Go to Home
            </Link>
          </div>
        ) : product ? (
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
                <div className="flex flex-col gap-2 ">
                  {product.finalDiscount > 0 ? (
                    <>
                      <div>
                        <p className="text-gray-600 ">Pre-Book Price</p>
                        <div className="text-3xl font-semibold primaryTextColor mt-1">
                          Tk. {formatPrice(Number(product.finalDiscount))}
                        </div>
                      </div>

                      <div className="text-gray-600 ">
                        <p>Regular Price</p>
                        Tk. {formatPrice(Number(product.finalPrice))}
                      </div>

                      <div className="text-gray-700">
                        You Are Saving Tk{" "}
                        {formatPrice(
                          Number(product.finalPrice - product.finalDiscount),
                        )}{" "}
                        by Pre-Booking
                      </div>
                    </>
                  ) : (
                    <div className="text-black font-medium">
                      Tk. {formatPrice(Number(product.finalPrice))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details (optional placeholder) */}
              <p className="text-gray-600 text-sm leading-relaxed">
                Reserve early and take advantage of the limited-time discounted
                pre-book price.
              </p>

              {/* CTA Button */}
              <button
                className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full"
                onClick={handleClick}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm Pre-Booking"}
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

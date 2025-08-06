import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore.js";
import ImageComponent from "./ImageComponent.jsx";
import {
  BookOpen,
  GraduationCap,
  Clock,
  HelpCircle,
  Calendar,
} from "lucide-react";

const ProductAddToCart = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 5;
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(product, quantity);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "BDT",
        value:
          product.finalDiscount > 0
            ? product.finalDiscount * quantity
            : product.finalPrice * quantity,
        items: [
          {
            item_id: product.productId,
            item_name: product.name,
            currency: "BDT",
            discount: product.finalPrice - product.finalDiscount,
            item_variant: "Default",
            price: product.finalDiscount || product.finalPrice,
            quantity,
          },
        ],
      },
    });
  };

  const handleQuantityChange = (type) => {
    if (type === "increase" && quantity < MAX_QUANTITY) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toLocaleString();
  };

  return (
    <div>
      <div>
        <div className="flex flex-col gap-3 md:col-span-4 lg:col-span-3 xl:col-span-4 pt-4 md:pt-0">
          <ImageComponent imageName={product.thumbnailImage} />

          <h2 className="text-xl primaryTextColor">{product.name}</h2>

          {/* Price Display (without variants) */}
          <div className="flex gap-2 items-center">
            {product.finalDiscount > 0 ? (
              <>
                <div className="line-through">
                  Tk. {formatPrice(Number(product.finalPrice))}
                </div>
                <div className="text-red-800">
                  Tk. {formatPrice(Number(product.finalDiscount))}
                </div>
                <div>
                  You Save: Tk{" "}
                  {formatPrice(
                    Number(product.finalPrice - product.finalDiscount),
                  )}
                </div>
              </>
            ) : (
              <div className="text-black font-medium">
                Tk. {formatPrice(Number(product.finalPrice))}
              </div>
            )}
          </div>

          {/* Stock Display */}
          <div>
            {product.finalStock === 0 ? (
              <span className="text-red-600 font-semibold">Stock Out</span>
            ) : product.finalStock < 20 ? (
              <span className="primaryTextColor font-semibold">
                Hurry up! Only {product.finalStock} left
              </span>
            ) : null}
          </div>

          {/* Quantity Selector and Add to Cart */}
          <div
            className={
              "flex gap-2  md:gap-6 xl:gap-15 items-center justify-baseline mt-2"
            }
          >
            {/* Quantity */}
            <div className={"rounded flex items-center justify-between"}>
              <button
                className={
                  "primaryBgColor accentTextColor px-2 py-2 md:py-3 rounded-l cursor-pointer"
                }
                onClick={() => handleQuantityChange("decrease")}
              >
                <FiMinus />
              </button>
              <span className={"px-3 py-1 md:py-2 primaryTextColor"}>
                {quantity}
              </span>
              <button
                className={
                  "primaryBgColor accentTextColor px-2 py-2 md:py-3 rounded-r cursor-pointer"
                }
                onClick={() => handleQuantityChange("increase")}
                disabled={quantity >= MAX_QUANTITY}
              >
                <FaPlus />
              </button>
            </div>

            {/* Add to Cart Button */}
            {product.finalStock === 0 ? (
              <button className="text-red-600 font-semibold" disabled>
                Stock Out
              </button>
            ) : (
              <button
                className="primaryBgColor accentTextColor px-2 py-1 md:py-2 rounded flex-grow cursor-pointer"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </button>
            )}
          </div>

          {/* Cash On Delivery */}
          <button
            className="primaryBgColor accentTextColor px-2 py-1 md:py-2 rounded cursor-pointer"
            onClick={() => {
              addToCart(product, quantity);
              navigate("/checkout");
            }}
          >
            Order with Cash on Delivery
          </button>
        </div>

        {/*Only for course*/}

        {product.type === "course" && (
          <div className="mt-2 p-2 secondaryTextColor flex flex-col gap-1">
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

            {/* Duration */}
            {product.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Duration: {product.duration}</span>
              </div>
            )}

            {/* Quizzes */}
            {product.quizzes && (
              <div className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>Quizzes: {product.quizzes}</span>
              </div>
            )}

            {/* Start Date */}
            {product.classStartDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span>Start Date: {product.classStartDate}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAddToCart;

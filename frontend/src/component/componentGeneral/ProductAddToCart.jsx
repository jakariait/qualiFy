import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore.js";
import ImageComponent from "./ImageComponent.jsx";
import {
  BookOpen,
  Clock,
  HelpCircle,
  Calendar,
  User,
  Book,
  ClipboardCheck,
  MessageSquare,
  FileText,
  ThumbsUp,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OrderCountBadge from "./OrderCountBadge.jsx";
import PrebookButton from "./PrebookButton.jsx";
import PrebookCountBadge from "./PrebookCountBadge.jsx";

const ProductAddToCart = ({ product }) => {
  const [openPdf, setOpenPdf] = useState(false);

  const handleOpenPdf = () => {
    if (product?.previewPdf) {
      setOpenPdf(true);
    } else {
    }
  };

  const handleClosePdf = () => {
    setOpenPdf(false);
  };

  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 5;
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = apiUrl.replace("/api", "");
  const src = `https://docs.google.com/gview?url=${baseUrl}/uploads/${product.previewPdf}&embedded=true`;

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

  console.log(product);

  return (
    <div>
      <div className="flex  flex-col gap-3">
        {/* Product Image */}
        <div className={"hidden md:block"}>
          <ImageComponent
            imageName={product.thumbnailImage}
            className={"w-full  object-cover"}
          />
        </div>

        {/* Product Name */}
        <h2 className="text-2xl heading primaryTextColor">{product.name}</h2>

        {/* Price Display */}
        <div className="flex  gap-2 items-center">
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

        {/*Conditionally Render Buy Now and PreBook Button*/}

        {product.isPreBooked ? (
          <PrebookButton product={product} quantity={quantity} />
        ) : (
          <>
            {/* Stock Display (only for book) */}
            {product.type === "book" && product.finalStock === 0 && (
              <div>
                <span className="text-red-600 font-semibold">Stock Out</span>
              </div>
            )}

            {/* Quantity & Action Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              {product.type === "book" ? (
                <>
                  {/* Quantity + Add To Cart in same line */}
                  <div className="flex gap-2 items-center">
                    {/* Quantity Selector */}
                    <div className="rounded flex items-center justify-between">
                      <button
                        className="primaryBgColor accentTextColor px-2 py-2 md:py-3 rounded-l cursor-pointer"
                        onClick={() => handleQuantityChange("decrease")}
                      >
                        <FiMinus />
                      </button>
                      <span className="px-3 py-1 md:py-2 primaryTextColor">
                        {quantity}
                      </span>
                      <button
                        className="primaryBgColor accentTextColor px-2 py-2 md:py-3 rounded-r cursor-pointer"
                        onClick={() => handleQuantityChange("increase")}
                        disabled={quantity >= MAX_QUANTITY}
                      >
                        <FaPlus />
                      </button>
                    </div>

                    {/* Add To Cart */}
                    {product.finalStock === 0 ? (
                      <button className="text-red-600 font-semibold" disabled>
                        Stock Out
                      </button>
                    ) : (
                      <button
                        className="primaryBgColor accentTextColor px-4 py-2 rounded flex-grow cursor-pointer"
                        onClick={handleAddToCart}
                      >
                        Add To Cart
                      </button>
                    )}
                  </div>

                  {/* Cash on Delivery Button */}
                  <button
                    className="primaryBgColor cursor-pointer accentTextColor px-4 py-2 rounded w-full"
                    onClick={() => {
                      addToCart(product, quantity);
                      navigate("/checkout");
                    }}
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                // Non-book buttons side-by-side
                <div className="flex gap-2">
                  <button
                    className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full"
                    onClick={handleAddToCart}
                  >
                    Add To Cart
                  </button>
                  <button
                    className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full"
                    onClick={() => {
                      addToCart(product, 1);
                      navigate("/checkout");
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/*Pre-Booked Counter*/}
      {product.isPreBooked && (
        <div className={"p-2 mt-2 -mb-7"}>
          <PrebookCountBadge prebook={product.bookingNumber} productId={product.id} />
        </div>
      )}

      {/*Only for Book*/}
      {product.type === "book" && (
        <div>
          <div className={"mt-5 p-2"}>
            {product.numberOfPages > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Number of Pages: {product.numberOfPages}</span>
              </div>
            )}

            {product.numberOfChapters > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Number of Chapters: {product.numberOfChapters}</span>
              </div>
            )}

            {product.recommendedFor && (
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-purple-600" />
                <span>Recommend For: {product.recommendedFor}</span>
              </div>
            )}
          </div>
          <div className=" p-2 primaryTextColor flex justify-between items-center gap-1">
            {/* Author */}
            {product.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-purple-600" />
                <span>Author: {product.author}</span>
              </div>
            )}

            {/* Publication */}
            {product.publisher && (
              <div className="flex items-center gap-1">
                <Book className="w-4 h-4 text-yellow-600" />
                <span>Publication: {product.publisher}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {product.type === "book" && product.previewPdf && (
        <div className="mb-4">
          {/* Read eBook Button */}
          <button
            className="primaryBgColor accentTextColor cursor-pointer px-3 py-2 rounded w-full"
            onClick={handleOpenPdf}
          >
            Read The Book
          </button>
        </div>
      )}

      {/* Extra Info for Course */}
      {product.type === "course" && (
        <div className="mt-4 p-2 secondaryTextColor flex flex-col gap-1">
          {/*Show Enrolled when not in pre-booked */}

          {!product.isPreBooked && (
            <>
              {product.enrolledStudents && (
                <div className="flex items-center gap-1">
                  <OrderCountBadge
                    productId={product._id}
                    enrolledStudents={product.enrolledStudents}
                  />
                </div>
              )}
            </>
          )}

          {product.lessons && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-green-600" />
              <span>Lessons: {product.lessons}</span>
            </div>
          )}
          {product.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Duration: {product.duration}</span>
            </div>
          )}
          {product.quizzes && (
            <div className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Quizzes: {product.quizzes}</span>
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
                Live Doubt solving Session: {product.liveDoubtSolutionsSession}
              </span>
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

      {/* Modal PDF Preview */}
      <Dialog open={openPdf} onClose={handleClosePdf} fullWidth maxWidth="md">
        <DialogTitle className="flex justify-between items-center">
          <span>{product.name}</span>
          <IconButton onClick={handleClosePdf}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="w-full h-[80vh]">
            <iframe
              src={src}
              title="eBook Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductAddToCart;

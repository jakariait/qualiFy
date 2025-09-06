import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore.js";
import GeneralInfoStore from "../../store/GeneralInfoStore.js";

const TimedDialog = ({ type, id, product }) => {
  const { addToCart } = useCartStore();
  const { GeneralInfoList } = GeneralInfoStore();

  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (GeneralInfoList && GeneralInfoList.productPopUpIsOpen) {
      const key = `dialogShown-${type}${id ? "-" + id : ""}`;
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem(key)) {
          setOpen(true);
          sessionStorage.setItem(key, "true");
        }
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [type, id, GeneralInfoList]);

  const handleClose = () => {
    setOpen(false);
  };

  const renderActions = () => {
    switch (type) {
      case "course":
        return (
          <>
            <Link
              to="/free-resources"
              className="px-4 py-2 mb-2 border primaryTextColor rounded-md  text-center w-full"
            >
              Download Free Study Materials
            </Link>
            <button
              onClick={() => {
                addToCart(product, quantity);
                navigate("/checkout");
              }}
              className="px-4 py-2 primaryBgColor accentTextColor rounded-md shadow-[0_0_15px_rgba(239,68,68,0.8)] w-full cursor-pointer"
            >
              Enroll Course Now
            </button>
          </>
        );
      case "exam":
        return (
          <>
            <Link
              to="/free-resources"
              className="px-4 py-2 mb-2 border primaryTextColor rounded-md  text-center w-full"
            >
              Download Free Study Materials
            </Link>
            <button
              onClick={() => {
                addToCart(product, quantity);
                navigate("/checkout");
              }}
              className="px-4 py-2 primaryBgColor accentTextColor rounded-md shadow-[0_0_15px_rgba(239,68,68,0.8)] w-full cursor-pointer"
            >
              Purchase Exam Bundle
            </button>
          </>
        );
      case "book":
        return (
          <>
            <Link
              to="/free-resources"
              className="px-4 py-2 mb-2 border primaryTextColor rounded-md  text-center w-full"
            >
              Download Free Study Materials
            </Link>
            <button
              onClick={() => {
                addToCart(product, quantity);
                navigate("/checkout");
              }}
              className="px-4 py-2 primaryBgColor accentTextColor rounded-md shadow-[0_0_15px_rgba(239,68,68,0.8)] w-full cursor-pointer"
            >
              Purchase the Book
            </button>
          </>
        );
      default:
        return (
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 w-full"
          >
            Close
          </button>
        );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="relative  text-center">
        <span>Let's qualify</span>
        <button
          onClick={handleClose}
          className="primaryTextColor text-xl font-bold absolute top-1/2 right-6 -translate-y-1/2"
        >
          ✕
        </button>
      </DialogTitle>

      <DialogContent className="flex  flex-col items-center text-center">
        <p className={""}>Hey! this may help you</p>
        <div className="mt-4 gap-4 flex w-64 flex-col items-center justify-center">
          {renderActions()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimedDialog;

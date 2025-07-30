import React, { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const AbandonedCartTracker = ({
  addressData,
  cart,
  totalAmount,
  user,
  apiUrl,
  orderPlaced,
}) => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Ref to keep latest orderPlaced value
  const orderPlacedRef = useRef(orderPlaced);

  useEffect(() => {
    orderPlacedRef.current = orderPlaced;
    if (orderPlaced) {
      sessionStorage.setItem("orderPlaced", "true");
      sessionStorage.removeItem("wasInCheckout");
      sessionStorage.removeItem("abandonedCartSent");
    }
  }, [orderPlaced]);

  const isOrderPlaced = useCallback(() => {
    const refValue = orderPlacedRef.current;
    const storageValue = sessionStorage.getItem("orderPlaced") === "true";
    return refValue || storageValue;
  }, []);

  const canSend = useCallback(() => {
    const phoneValid = addressData?.phone?.length === 11;
    const cartValid = cart?.length > 0;
    const notSentBefore = !sessionStorage.getItem("abandonedCartSent");
    return phoneValid && cartValid && notSentBefore;
  }, [addressData?.phone, cart?.length, isOrderPlaced]);

  const getPayload = useCallback(() => {
    return {
      userId: user?._id || undefined,
      fullName: addressData?.fullName || undefined,
      number: addressData?.phone,
      email: addressData?.email || undefined,
      address: addressData?.address || undefined,
      cartItems: cart.map((item) => {
        const variantId =
          item.variantId && item.variantId !== "Default"
            ? item.variantId
            : undefined;
        return {
          productId: item.productId,
          ...(variantId && { variantId }),
          price:
            item.discountPrice > 0 ? item.discountPrice : item.originalPrice,
          quantity: item.quantity,
        };
      }),
      totalAmount,
      orderPlaced: orderPlaced,
    };
  }, [addressData, cart, totalAmount, user]);

  const sendAbandonedCart = useCallback(() => {
    const payload = getPayload();
    try {
      navigator.sendBeacon(
        `${apiUrl}/abandoned-cart`,
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
      sessionStorage.setItem("abandonedCartSent", "true");
    } catch (error) {}
  }, [apiUrl, canSend, getPayload]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (isOrderPlaced()) {
        return;
      }

      const currentPath = window.location.pathname;
      const wasInCheckout = sessionStorage.getItem("wasInCheckout") === "true";

      if (currentPath.includes("/checkout")) {
        sessionStorage.setItem("wasInCheckout", "true");
        sessionStorage.removeItem("abandonedCartSent");
      } else if (wasInCheckout) {
        sendAbandonedCart();
        sessionStorage.removeItem("wasInCheckout");
      }
    };

    handleRouteChange(); // initial check

    window.addEventListener("popstate", handleRouteChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleRouteChange();
    };

    window.history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [sendAbandonedCart, isOrderPlaced]);

  useEffect(() => {
    const handleUnload = () => {
      if (
        !isOrderPlaced() &&
        sessionStorage.getItem("wasInCheckout") === "true"
      ) {
        sendAbandonedCart();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sendAbandonedCart, isOrderPlaced]);

  return null;
};

export default AbandonedCartTracker;

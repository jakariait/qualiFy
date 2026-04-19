// import { useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import useCartStore from "../../store/useCartStore";
//
// const BkashCallback = () => {
//   const navigate = useNavigate();
//   const { clearCart } = useCartStore();
//
//   useEffect(() => {
//     const executeBkash = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const paymentID = urlParams.get("paymentID");
//
//       if (!paymentID) return;
//
//       try {
//         const execRes = await axios.post(
//           `${import.meta.env.VITE_API_URL}/bkashexecute`,
//           { paymentID }
//         );
//
//         if (execRes.data && execRes.data.paymentID) {
//           const orderPayload = JSON.parse(localStorage.getItem("bkash_order_payload"));
//           if (!orderPayload) return;
//
//           orderPayload.paymentId = paymentID;
//
//           const orderRes = await axios.post(
//             `${import.meta.env.VITE_API_URL}/orders`,
//             orderPayload
//           );
//
//           if (orderRes.data.success) {
//             clearCart();
//             localStorage.removeItem("bkash_order_payload");
//             navigate(`/thank-you/${orderRes.data.order.orderNo}`);
//           }
//         }
//       } catch (err) {
//         console.error("bKash callback processing failed:", err);
//       }
//     };
//
//     executeBkash();
//   }, [clearCart, navigate]);
//
//   return null;
// };
//
// export default BkashCallback;


import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";

const BkashCallback = () => {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [statusMsg, setStatusMsg] = useState("Processing your payment…");

  useEffect(() => {
    const executeBkash = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentID = urlParams.get("paymentID");
      const status = urlParams.get("status");

      if (status === "cancel" || status === "failure" || !paymentID) {
        setStatusMsg("Payment cancelled or failed. Redirecting…");
        setTimeout(() => navigate("/checkout", { replace: true }), 2000);
        return;
      }

      // Prevent double-execution (React StrictMode fires effects twice in dev)
      const execKey = `bkash_executed_${paymentID}`;
      if (sessionStorage.getItem(execKey)) return;
      sessionStorage.setItem(execKey, "1");

      try {
        const execRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/bkashexecute`,
          { paymentID }
        );

        // Execute failed if response contains an error or no paymentID
        if (execRes.data?.error || !execRes.data?.paymentID) {
          setStatusMsg("Payment verification failed. Redirecting…");
          setTimeout(() => navigate("/checkout", { replace: true }), 2000);
          return;
        }

        const orderPayload = JSON.parse(localStorage.getItem("bkash_order_payload"));
        if (!orderPayload) {
          // Payload already consumed — order was likely already created
          setStatusMsg("Order already processed. Redirecting…");
          setTimeout(() => navigate("/", { replace: true }), 2000);
          return;
        }

        orderPayload.paymentId  = paymentID;
        orderPayload.paymentStatus = "paid";
        orderPayload.transId    = execRes.data.trxID;          // real bKash trxID
        orderPayload.advanceAmount = Number(execRes.data.amount) || 0;

        const orderRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/orders`,
          orderPayload
        );

        if (orderRes.data?.success) {
          clearCart();
          localStorage.removeItem("bkash_order_payload");
          // replace: true removes /bkash-callback from history so back button won't re-trigger
          navigate(`/thank-you/${orderRes.data.order.orderNo}`, { replace: true });
        } else {
          setStatusMsg(orderRes.data?.message || "Order creation failed. Redirecting…");
          setTimeout(() => navigate("/checkout", { replace: true }), 2000);
        }
      } catch (err) {
        console.error("bKash callback processing failed:", err);
        setStatusMsg("Something went wrong. Redirecting…");
        setTimeout(() => navigate("/checkout", { replace: true }), 2000);
      }
    };

    executeBkash();
  }, [clearCart, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #eee", borderTop: "4px solid #E2136E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#555", fontSize: 15 }}>{statusMsg}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BkashCallback;

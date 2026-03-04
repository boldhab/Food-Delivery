import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await driverOrderService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const runAction = async (fn, payload, successText) => {
    try {
      await fn(id, payload);
      toast.success(successText);
      loadOrder();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <section>
      <h1>{order.orderNumber}</h1>
      <p>Status: {order.orderStatus}</p>
      <p>
        Drop-off: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
      </p>
      <p>Instructions: {order.deliveryAddress?.instructions || "N/A"}</p>

      <div className="grid">
        <button onClick={() => runAction(driverOrderService.checkIn, undefined, "Checked in at restaurant")}>Check In</button>
        <button
          onClick={() =>
            runAction(driverOrderService.pickup, {
              verifyItems: true,
              verifyPackaging: true,
              verifyTamperSeal: true,
              note: "Order verified and picked up"
            }, "Marked as picked up")
          }
        >
          Mark Picked Up
        </button>
        <button
          onClick={() =>
            runAction(driverOrderService.startTransit, {
              instructionsFollowed: true,
              note: "In transit via optimized route"
            }, "Transit started")
          }
        >
          Start Transit
        </button>
        <button
          onClick={() =>
            runAction(driverOrderService.completeDelivery, {
              handoffType: "contactless",
              codCollected: order.paymentMethod === "cash_on_delivery",
              codAmount: order.paymentMethod === "cash_on_delivery" ? order.totalAmount : 0,
              note: "Delivered successfully"
            }, "Delivery completed")
          }
        >
          Mark Delivered
        </button>
        <button
          onClick={() =>
            runAction(driverOrderService.submitPostDelivery, {
              customerRating: 5,
              issueType: "",
              issueDescription: ""
            }, "Post-delivery report saved")
          }
        >
          Submit Post-Delivery
        </button>
        <button
          onClick={() =>
            runAction(driverOrderService.submitCompliance, {
              vehicleConditionOk: true,
              trafficLawsFollowed: true,
              hygieneStandardsMet: true,
              uniformWorn: true
            }, "Compliance submitted")
          }
        >
          Submit Compliance
        </button>
      </div>
    </section>
  );
};

export default DeliveryDetailPage;

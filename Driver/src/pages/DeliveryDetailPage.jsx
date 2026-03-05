import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const loadMessages = async () => {
    try {
      const data = await driverOrderService.getOrderMessages(id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load conversation");
    }
  };

  useEffect(() => {
    loadOrder();
    loadMessages();
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

  const handleMarkDelivered = async () => {
    try {
      await driverOrderService.completeDelivery(id, {
        handoffType: "contactless",
        codCollected: order.paymentMethod === "cash_on_delivery",
        codAmount: order.paymentMethod === "cash_on_delivery" ? order.totalAmount : 0,
        note: "Delivered successfully"
      });
      toast.success("Delivery completed");
      navigate("/driver/delivery-history");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    }
  };

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setSendingMessage(true);
    try {
      await driverOrderService.sendOrderMessage(id, trimmed);
      setMessageText("");
      await loadMessages();
      toast.success("Message sent");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
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
          onClick={handleMarkDelivered}
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

      <div style={{ marginTop: 24 }}>
        <h2>Order Communication</h2>
        <p>Talk with the customer here. Admin is notified for each message.</p>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, maxHeight: 280, overflowY: "auto" }}>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((entry) => (
              <div key={entry._id} style={{ marginBottom: 10 }}>
                <strong>{entry.senderRole}</strong>: {entry.message}
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write a message to customer..."
            style={{ flex: 1 }}
          />
          <button onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()}>
            {sendingMessage ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default DeliveryDetailPage;

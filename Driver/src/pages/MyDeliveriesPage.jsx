import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const MyDeliveriesPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousOrderIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const requestedStatus = status === "active" ? "" : status;
      const data = await driverOrderService.getMyDeliveries(requestedStatus);
      const filteredData = status === "active"
        ? data.filter((order) => ["confirmed", "preparing", "out_for_delivery"].includes(order.orderStatus))
        : data;

      setOrders(filteredData);
      const currentIds = new Set(filteredData.map((order) => order._id));

      if (!firstLoadRef.current) {
        const previousIds = previousOrderIdsRef.current;
        const newOrders = filteredData.filter((order) => !previousIds.has(order._id));
        newOrders.forEach((order) => {
          toast.success(`New assigned order: ${order.orderNumber}`);
        });
      }

      previousOrderIdsRef.current = currentIds;
      if (firstLoadRef.current) {
        firstLoadRef.current = false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load deliveries");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <section>
      <div className="titleRow">
        <h1>My Deliveries</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
        </select>
      </div>
      <p style={{ marginTop: 8, color: "#64748b" }}>
        Delivered orders are moved to Delivery History.
      </p>
      {loading ? <p>Loading...</p> : null}
      {!loading && orders.length === 0 ? <p>No deliveries found.</p> : null}
      <div className="list">
        {orders.map((order) => (
          <button className="listItem" key={order._id} onClick={() => navigate(`/driver/deliveries/${order._id}`)}>
            <span>{order.orderNumber}</span>
            <span>{order.orderStatus}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MyDeliveriesPage;

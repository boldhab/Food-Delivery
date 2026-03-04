import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const MyDeliveriesPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousOrderIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await driverOrderService.getMyDeliveries(status);
      setOrders(data);
      const currentIds = new Set(data.map((order) => order._id));

      if (!firstLoadRef.current) {
        const previousIds = previousOrderIdsRef.current;
        const newOrders = data.filter((order) => !previousIds.has(order._id));
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
          <option value="">All</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
        </select>
      </div>
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

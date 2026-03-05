import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const DeliveryHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await driverOrderService.getMyDeliveries("delivered");
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load delivery history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section>
      <div className="titleRow">
        <h1>Delivery History</h1>
        <button onClick={loadHistory}>Refresh</button>
      </div>
      {loading ? <p>Loading...</p> : null}
      {!loading && orders.length === 0 ? <p>No delivered orders found.</p> : null}
      <div className="list">
        {orders.map((order) => (
          <button className="listItem" key={order._id} onClick={() => navigate(`/driver/deliveries/${order._id}`)}>
            <span>{order.orderNumber}</span>
            <span>
              Delivered{" "}
              {order.actualDeliveryTime ? new Date(order.actualDeliveryTime).toLocaleString() : ""}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DeliveryHistoryPage;

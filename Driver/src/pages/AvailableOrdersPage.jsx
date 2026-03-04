import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const AvailableOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await driverOrderService.getAvailableOrders();
      setOrders(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load available orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAccept = async (id) => {
    try {
      await driverOrderService.acceptOrder(id, "Accepted by driver");
      toast.success("Order accepted");
      loadOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not accept order");
    }
  };

  const handleDecline = async (id) => {
    try {
      await driverOrderService.declineOrder(id, "Declined by driver");
      toast.success("Order declined");
      loadOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not decline order");
    }
  };

  return (
    <section>
      <div className="titleRow">
        <h1>Available Delivery Requests</h1>
        <button onClick={loadOrders}>Refresh</button>
      </div>
      {loading ? <p>Loading...</p> : null}
      {!loading && orders.length === 0 ? <p>No delivery requests available.</p> : null}
      <div className="grid">
        {orders.map((order) => (
          <div className="card" key={order._id}>
            <h3>{order.orderNumber}</h3>
            <p>Pickup: Restaurant</p>
            <p>
              Drop: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
            </p>
            <p>Payout: ${Number(order.deliveryFee || 0).toFixed(2)}</p>
            <div className="actions">
              <button onClick={() => navigate(`/driver/deliveries/${order._id}`)}>View</button>
              <button onClick={() => handleAccept(order._id)}>Accept</button>
              <button className="danger" onClick={() => handleDecline(order._id)}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AvailableOrdersPage;

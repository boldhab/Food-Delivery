import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FiArrowLeft, 
  FiTruck, 
  FiMapPin, 
  FiCheckCircle, 
  FiNavigation, 
  FiSend, 
  FiPackage, 
  FiShield, 
  FiClock,
  FiPhone,
  FiUser
} from "react-icons/fi";
import driverOrderService from "../services/driverOrderService";
import { useOrderSocket, emitDriverLocation } from "../../../shared/socket";
import DriverNavigationMap from "../components/DriverNavigationMap";
import ProofOfDeliveryModal from "../components/ProofOfDeliveryModal";
import SlideToConfirm from "../components/SlideToConfirm";

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [showPodModal, setShowPodModal] = useState(false);
  const [_proximityAlert, setProximityAlert] = useState(null);

  const messagesEndRef = useRef(null);
  const watchIdRef = useRef(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await driverOrderService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadMessages = useCallback(async () => {
    try {
      const data = await driverOrderService.getOrderMessages(id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }, [id]);

  // Connect to real-time WebSocket for this order
  useOrderSocket(id, {
    onOrderUpdated: (updatedOrder) => {
      if (updatedOrder && (updatedOrder.id === id || updatedOrder._id === id)) {
        setOrder(updatedOrder);
      }
    },
    onNewMessage: (newMsg) => {
      if (!newMsg) return;
      setMessages((prev) => {
        const exists = prev.some((m) => (m._id || m.id) === (newMsg._id || newMsg.id));
        if (exists) return prev;
        if (newMsg.senderRole === "user") {
          toast(`Customer: ${newMsg.message}`, { icon: "💬" });
        }
        return [...prev, newMsg];
      });
    }
  });

  useEffect(() => {
    loadOrder();
    loadMessages();
  }, [loadOrder, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // GPS Streaming handler
  const startGpsStreaming = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by this browser");
      return;
    }

    setIsGpsStreaming(true);
    toast.success("Live GPS streaming activated", { icon: "📡" });

    // Stream immediate position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ latitude, longitude });
        emitDriverLocation(id, latitude, longitude);
      },
      (err) => console.warn("Initial GPS error:", err.message),
      { enableHighAccuracy: true }
    );

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ latitude, longitude });
        emitDriverLocation(id, latitude, longitude);
      },
      (err) => console.warn("GPS watch error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [id]);

  const stopGpsStreaming = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsGpsStreaming(false);
    toast("GPS streaming paused", { icon: "⏸️" });
  }, []);

  // Auto-start GPS if order is out_for_delivery
  useEffect(() => {
    if (order?.orderStatus === "out_for_delivery" && !isGpsStreaming) {
      startGpsStreaming();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [order?.orderStatus, isGpsStreaming, startGpsStreaming]);

  const runAction = async (fn, payload, successText) => {
    setActionLoading(true);
    try {
      await fn(id, payload);
      toast.success(successText);
      await loadOrder();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPodModal = () => {
    setShowPodModal(true);
  };

  const handleCompleteDeliveryWithPod = async (payload) => {
    setActionLoading(true);
    try {
      await driverOrderService.completeDelivery(id, payload);
      stopGpsStreaming();
      toast.success("Delivery completed with proof of delivery!", { icon: "🏁" });
      await loadOrder();
      navigate("/driver/delivery-history");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await driverOrderService.sendOrderMessage(id, trimmed);
      setMessageText("");
      if (res) {
        setMessages((prev) => {
          const exists = prev.some((m) => (m._id || m.id) === (res._id || res.id));
          return exists ? prev : [...prev, res];
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-300">Loading Delivery Cockpit...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
        <p className="text-lg font-bold text-white">Order Not Found</p>
        <Link to="/driver/my-deliveries" className="text-xs text-emerald-400 font-bold hover:underline">
          Return to My Deliveries
        </Link>
      </div>
    );
  }

  const dropoffStreet = order.deliveryAddress?.street || order.deliveryStreet || "Standard Address";
  const dropoffCity = order.deliveryAddress?.city || order.deliveryCity || "";
  const instructions = order.deliveryAddress?.instructions || order.deliveryInstructions || "No special instructions.";

  const baseDeliveryFee = Number(order.deliveryFee || 5.0);
  const tipAmount = Number(order.driverWorkflow?.tip || order.tip || 0);
  const totalTripPayout = (baseDeliveryFee + tipAmount).toFixed(2);
  const podData = order.driverWorkflow?.proofOfDelivery;

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
          {isGpsStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping" />
              GPS Stream
            </span>
          )}
        </div>
      </div>

      {/* Order Overview Banner & Transparent Earnings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="text-2xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
            Active Delivery
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assigned: {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <span className="px-3 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {order.orderStatus.replace(/_/g, " ")}
          </span>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {totalTripPayout} ETB
            </div>
            <div className="text-2xs text-muted-foreground font-medium tabular-nums">
              Base {baseDeliveryFee.toFixed(2)} ETB {tipAmount > 0 ? `+ ${tipAmount.toFixed(2)} ETB Tip` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Cockpit Grid: Two-column on lg+, single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column (lg:col-span-7): Navigation Map, SlideToConfirm, Actions & POD */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Phase 2: In-App Turn-by-Turn Leaflet Map */}
          <DriverNavigationMap
            order={order}
            currentCoords={currentCoords}
            isGpsStreaming={isGpsStreaming}
            onProximityAlert={(alert) => setProximityAlert(alert)}
          />

          {/* Primary Slide-To-Confirm Gesture Cockpit */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FiNavigation className="text-emerald-500 dark:text-emerald-400" />
                Primary Action
              </span>
              <span className="text-2xs font-medium text-muted-foreground">
                Swipe right to advance
              </span>
            </div>

            {order.orderStatus === "delivered" ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  Delivery Completed & Verified
                </span>
                <span className="text-sm font-bold tabular-nums text-foreground">+${totalTripPayout}</span>
              </div>
            ) : order.orderStatus === "out_for_delivery" ? (
              <SlideToConfirm
                label="SLIDE TO COMPLETE DELIVERY (POD)"
                color="emerald"
                icon={FiCheckCircle}
                disabled={actionLoading}
                onConfirm={handleOpenPodModal}
              />
            ) : order.orderStatus === "ready_for_pickup" ? (
              <SlideToConfirm
                label="SLIDE TO CONFIRM PICKUP & SEAL"
                color="amber"
                icon={FiPackage}
                disabled={actionLoading}
                onConfirm={() =>
                  runAction(driverOrderService.pickup, {
                    verifyItems: true,
                    verifyPackaging: true,
                    verifyTamperSeal: true,
                    note: "Order verified and picked up"
                  }, "Marked as picked up & sealed")
                }
              />
            ) : (
              <SlideToConfirm
                label="SLIDE TO CHECK IN AT RESTAURANT"
                color="blue"
                icon={FiClock}
                disabled={actionLoading}
                onConfirm={() => runAction(driverOrderService.checkIn, undefined, "Checked in at restaurant")}
              />
            )}

            {/* Quick Secondary Action Controls */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => (isGpsStreaming ? stopGpsStreaming() : startGpsStreaming())}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <FiNavigation className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                {isGpsStreaming ? "Pause GPS" : "Stream GPS"}
              </button>
              <button
                onClick={() =>
                  runAction(driverOrderService.submitCompliance, {
                    vehicleConditionOk: true,
                    trafficLawsFollowed: true,
                    hygieneStandardsMet: true,
                    uniformWorn: true
                  }, "Safety compliance submitted")
                }
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <FiShield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Safety Check
              </button>
            </div>

            {currentCoords && (
              <div className="text-2xs font-mono tabular-nums text-muted-foreground text-center">
                Broadcasting: {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
              </div>
            )}
          </div>

          {/* Verified Proof of Delivery Photo Card (if delivered) */}
          {podData?.imageUrl && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-500/30 shadow-xs dark:shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <FiShield className="w-4 h-4" />
                  Verified Proof of Delivery
                </span>
                <span className="text-2xs tabular-nums text-muted-foreground">
                  {podData.capturedAt ? new Date(podData.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-emerald-500/20 max-h-56 bg-slate-100 dark:bg-slate-950">
                <img
                  src={podData.imageUrl}
                  alt="Proof of Delivery"
                  className="w-full h-48 object-cover"
                />
              </div>
              {podData.notes && (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  &ldquo;{podData.notes}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column (lg:col-span-5): Destination & Live Customer Chat */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Customer Drop-off Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
              <FiMapPin className="text-emerald-500 dark:text-emerald-400" />
              Drop-Off Destination
            </h2>
            <div>
              <div className="font-semibold text-base text-foreground">
                {dropoffStreet}
              </div>
              {dropoffCity && (
                <div className="text-xs text-muted-foreground">
                  {dropoffCity}
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-300">
              <span className="font-semibold">Instructions: </span>
              {instructions}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${dropoffStreet}, ${dropoffCity}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FiNavigation className="w-3.5 h-3.5" />
                Open Maps
              </a>

              {order.customerPhone ? (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  Call Customer
                </a>
              ) : (
                <div className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 text-xs text-center font-medium flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  No Phone Listed
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Customer Chat */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl flex flex-col h-[460px] lg:h-[490px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <FiUser className="text-emerald-500 dark:text-emerald-400" />
                  Customer Direct Chat
                </h3>
                <p className="text-xs text-muted-foreground">
                  Real-time updates delivered instantly
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <FiSend className="w-8 h-8 mb-2 opacity-30 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">
                    No messages yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Message the customer if you need gate access codes or delivery assistance.
                  </p>
                </div>
              ) : (
                messages.map((entry, idx) => {
                  const isDriver = entry.senderRole === "driver";
                  const key = entry._id || entry.id || `msg-${idx}`;
                  return (
                    <div
                      key={key}
                      className={`flex flex-col ${isDriver ? "items-end" : "items-start"}`}
                    >
                      <div className="text-2xs font-semibold text-muted-foreground mb-0.5 px-1 capitalize">
                        {isDriver ? "You (Driver)" : "Customer"}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                          isDriver
                            ? "bg-[var(--primary)] text-white rounded-br-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200 dark:border-slate-700/60"
                        }`}
                      >
                        <p className="break-words leading-relaxed">{entry.message}</p>
                        <div
                          className={`text-2xs mt-1 text-right tabular-nums ${
                            isDriver ? "text-rose-100" : "text-muted-foreground"
                          }`}
                        >
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Message customer..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
              />
              <button
                type="submit"
                disabled={sendingMessage || !messageText.trim()}
                className="w-9 h-9 flex items-center justify-center bg-[var(--primary)] hover:opacity-90 text-white font-semibold rounded-xl shadow-xs transition-all disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <FiSend className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Proof of Delivery Modal */}
      <ProofOfDeliveryModal
        isOpen={showPodModal}
        order={order}
        onClose={() => setShowPodModal(false)}
        onComplete={handleCompleteDeliveryWithPod}
      />

    </div>
  );
};

export default DeliveryDetailPage;

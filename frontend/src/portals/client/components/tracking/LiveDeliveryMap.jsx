import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiNavigation, FiClock, FiMapPin, FiTruck } from 'react-icons/fi';

// Base coordinates helper for demo / fallback addresses
const getBaseCoordinates = (order) => {
  // Center near Addis Ababa, Ethiopia (Bole central area)
  // Restaurant is situated at Bole Road, customer at Bole Medhanealem
  const restaurant = [9.0054, 38.7845];
  const customer = [9.0215, 38.7758];

  return {
    restaurant,
    customer
  };
};

const createMarkerIcon = (type) => {
  if (type === 'restaurant') {
    return L.divIcon({
      className: 'custom-map-marker-restaurant',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #ea580c; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19]
    });
  }

  if (type === 'customer') {
    return L.divIcon({
      className: 'custom-map-marker-customer',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19]
    });
  }

  // Driver Courier Marker
  return L.divIcon({
    className: 'custom-map-marker-driver',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="position: relative; width: 42px; height: 42px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5); border: 2.5px solid white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18.5" cy="17.5" r="3.5"></circle>
            <circle cx="5.5" cy="17.5" r="3.5"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21]
  });
};

const LiveDeliveryMap = ({ order, driverLocation }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const [etaMinutes, setEtaMinutes] = useState(20);

  const isDelivered = ['delivered', 'complete', 'completed'].includes(order?.orderStatus);
  const isOutForDelivery = order?.orderStatus === 'out_for_delivery';

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { restaurant, customer } = getBaseCoordinates(order);

    // Initial driver position:
    // If live GPS location received, use it; otherwise place near restaurant or midpoint
    let initialDriverPos = [
      (restaurant[0] + customer[0]) / 2,
      (restaurant[1] + customer[1]) / 2
    ];

    if (driverLocation?.latitude && driverLocation?.longitude) {
      initialDriverPos = [driverLocation.latitude, driverLocation.longitude];
    } else if (!isOutForDelivery) {
      initialDriverPos = restaurant;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(initialDriverPos, 13);

    mapInstanceRef.current = map;

    // CartoDB Voyager tiles (crisp, modern vector styling)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 1. Restaurant Marker
    const restaurantMarker = L.marker(restaurant, {
      icon: createMarkerIcon('restaurant')
    }).addTo(map);
    restaurantMarker.bindPopup('<b>Food Hub Kitchen</b><br>Order Prepared Here');

    // 2. Customer Drop-off Marker
    const customerMarker = L.marker(customer, {
      icon: createMarkerIcon('customer')
    }).addTo(map);
    const dropAddress = order?.deliveryAddress?.street || order?.deliveryStreet || 'Delivery Address';
    customerMarker.bindPopup(`<b>Destination</b><br>${dropAddress}`);

    // 3. Driver Marker
    const driverMarker = L.marker(initialDriverPos, {
      icon: createMarkerIcon('driver'),
      zIndexOffset: 1000
    }).addTo(map);
    driverMarker.bindPopup('<b>Courier</b><br>On the way with your meal');
    driverMarkerRef.current = driverMarker;

    // 4. Delivery Route Line
    const routeCoords = [restaurant, initialDriverPos, customer];
    const polyline = L.polyline(routeCoords, {
      color: '#10b981',
      weight: 4,
      opacity: 0.75,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);
    routePolylineRef.current = polyline;

    // Fit map to include restaurant, driver, and customer markers
    const group = L.featureGroup([restaurantMarker, customerMarker, driverMarker]);
    map.fitBounds(group.getBounds().pad(0.18));

    // Invalidate size after container settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order?.id, order?._id]);

  // Handle live driver location updates
  useEffect(() => {
    if (!driverMarkerRef.current || !driverLocation?.latitude || !driverLocation?.longitude) {
      return;
    }

    const newPos = [driverLocation.latitude, driverLocation.longitude];
    driverMarkerRef.current.setLatLng(newPos);

    // Update ETA dynamically
    setEtaMinutes((prev) => Math.max(3, prev - 1));

    // Update polyline from new driver position to customer
    const { restaurant, customer } = getBaseCoordinates(order);
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs([restaurant, newPos, customer]);
    }

    // Smoothly pan map towards driver if zoomed in
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(newPos, { animate: true, duration: 1.2 });
    }
  }, [driverLocation, order]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const { restaurant, customer } = getBaseCoordinates(order);
    const driverPos = driverMarkerRef.current ? driverMarkerRef.current.getLatLng() : restaurant;
    const bounds = L.latLngBounds([restaurant, customer, driverPos]);
    mapInstanceRef.current.fitBounds(bounds.pad(0.2), { animate: true });
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating ETA & Status Card */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[400] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            <FiTruck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                {isDelivered ? 'Order Delivered' : isOutForDelivery ? 'Driver In Transit' : 'Preparing at Kitchen'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <FiClock className="w-4 h-4 text-slate-400" />
              <span>{isDelivered ? 'Arrived at your door' : `Estimated Arrival: ~${etaMinutes} mins`}</span>
            </div>
          </div>
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className="self-end sm:self-auto px-3.5 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          title="Center entire delivery route"
        >
          <FiNavigation className="w-3.5 h-3.5 text-emerald-500" />
          <span>Fit Route</span>
        </button>
      </div>

      {/* Bottom Live Streaming Indicator */}
      <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>
          {driverLocation?.latitude
            ? `GPS Live: ${driverLocation.latitude.toFixed(4)}, ${driverLocation.longitude.toFixed(4)}`
            : 'Live Satellite Tracking Active'}
        </span>
      </div>
    </div>
  );
};

export default LiveDeliveryMap;

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FiNavigation, 
  FiMapPin, 
  FiCompass, 
  FiMaximize2, 
  FiLayers, 
  FiAlertCircle, 
  FiCheckCircle 
} from 'react-icons/fi';

// Calculate Haversine distance in meters
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Custom marker icons for driver navigation
const createDriverIcon = (heading = 0) => {
  return L.divIcon({
    className: 'driver-nav-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        <span style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.6); display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

const createWaypointIcon = (type) => {
  if (type === 'restaurant') {
    return L.divIcon({
      className: 'restaurant-nav-marker',
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: #ea580c; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19]
    });
  }

  // Customer drop-off icon
  return L.divIcon({
    className: 'customer-nav-marker',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: #2563eb; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

// Safe mobile haptic feedback helper
const triggerHaptic = (pattern = [150, 75, 150, 75, 250]) => {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (_e) {
    // Vibration API may not be supported or blocked by user permissions
  }
};

const DriverNavigationMap = ({
  order,
  currentCoords,
  isGpsStreaming = false,
  onProximityAlert
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const restaurantGeofenceRef = useRef(null);
  const customerGeofenceRef = useRef(null);
  const hasVibratedRef = useRef({ restaurant: false, customer: false });

  const [followDriver, setFollowDriver] = useState(true);
  const [distanceToNextStop, setDistanceToNextStop] = useState(null);
  const [activeGeofenceAlert, setActiveGeofenceAlert] = useState(null);

  // Default central points for order simulation in Addis Ababa, Ethiopia
  const waypoints = useMemo(() => {
    const restaurantPos = [9.0054, 38.7845];
    const customerPos = [9.0215, 38.7758];
    return {
      restaurant: restaurantPos,
      customer: customerPos
    };
  }, []);

  const isOutForDelivery = order?.orderStatus === 'out_for_delivery';
  const targetWaypoint = isOutForDelivery ? waypoints.customer : waypoints.restaurant;
  const targetLabel = isOutForDelivery ? 'Customer Drop-off' : 'Central Kitchen / Pickup';

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter = currentCoords
      ? [currentCoords.latitude, currentCoords.longitude]
      : waypoints.restaurant;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Dark-themed tiles for driver ergonomics
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Zoom controls at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Restaurant marker & 100m geofence circle
    const restMarker = L.marker(waypoints.restaurant, {
      icon: createWaypointIcon('restaurant')
    }).addTo(map);
    restMarker.bindPopup('<b>Central Kitchen / Pickup</b><br>Order preparation area');

    const restGeofence = L.circle(waypoints.restaurant, {
      radius: 100, // 100 meters
      color: '#ea580c',
      weight: 1.5,
      fillColor: '#ea580c',
      fillOpacity: 0.12,
      dashArray: '4, 6'
    }).addTo(map);
    restaurantGeofenceRef.current = restGeofence;

    // Customer marker & 75m geofence circle
    const custMarker = L.marker(waypoints.customer, {
      icon: createWaypointIcon('customer')
    }).addTo(map);
    custMarker.bindPopup(`<b>Customer Destination</b><br>${order?.deliveryStreet || 'Drop-off address'}`);

    const custGeofence = L.circle(waypoints.customer, {
      radius: 75, // 75 meters
      color: '#2563eb',
      weight: 1.5,
      fillColor: '#2563eb',
      fillOpacity: 0.12,
      dashArray: '4, 6'
    }).addTo(map);
    customerGeofenceRef.current = custGeofence;

    // Driver Marker
    const initialDriverPos = currentCoords
      ? [currentCoords.latitude, currentCoords.longitude]
      : [waypoints.restaurant[0] + 0.003, waypoints.restaurant[1] - 0.003];

    const driverMarker = L.marker(initialDriverPos, {
      icon: createDriverIcon()
    }).addTo(map);
    driverMarker.bindPopup('<b>Your Current Location</b><br>Live GPS Courier');
    driverMarkerRef.current = driverMarker;

    // Route Polyline
    const polylineCoords = [initialDriverPos, targetWaypoint];
    const polyline = L.polyline(polylineCoords, {
      color: '#10b981',
      weight: 4.5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);
    routePolylineRef.current = polyline;

    // Initial bounds fit
    const group = L.featureGroup([restMarker, custMarker, driverMarker]);
    map.fitBounds(group.getBounds().pad(0.18));

    mapInstanceRef.current = map;

    // Observe container resizing to prevent Leaflet tile blanking/grey squares
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [waypoints, order?.deliveryStreet]);

  // Handle GPS coordinate updates
  useEffect(() => {
    if (!driverMarkerRef.current || !currentCoords?.latitude || !currentCoords?.longitude) return;

    const newPos = [currentCoords.latitude, currentCoords.longitude];
    driverMarkerRef.current.setLatLng(newPos);

    // Update navigation route line
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs([newPos, targetWaypoint]);
    }

    // Calculate distance to active target
    const distMeters = calculateDistanceMeters(
      currentCoords.latitude,
      currentCoords.longitude,
      targetWaypoint[0],
      targetWaypoint[1]
    );
    setDistanceToNextStop(distMeters);

    // Geofencing detection with mobile haptic feedback
    if (!isOutForDelivery && distMeters <= 100) {
      const alertMsg = '📍 Arrived within restaurant pickup geofence (100m)';
      setActiveGeofenceAlert({ type: 'restaurant', message: alertMsg, distance: distMeters });
      onProximityAlert?.({ type: 'restaurant', distance: distMeters });
      if (!hasVibratedRef.current.restaurant) {
        triggerHaptic([180, 80, 180, 80, 250]);
        hasVibratedRef.current.restaurant = true;
      }
    } else if (isOutForDelivery && distMeters <= 75) {
      const alertMsg = '🎯 Arrived within customer drop-off geofence (75m)';
      setActiveGeofenceAlert({ type: 'customer', message: alertMsg, distance: distMeters });
      onProximityAlert?.({ type: 'customer', distance: distMeters });
      if (!hasVibratedRef.current.customer) {
        triggerHaptic([180, 80, 180, 80, 250]);
        hasVibratedRef.current.customer = true;
      }
    } else {
      setActiveGeofenceAlert(null);
      if (distMeters > 180) {
        hasVibratedRef.current = { restaurant: false, customer: false };
      }
    }

    // Auto-center map if follow mode is active
    if (followDriver && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(newPos, { animate: true, duration: 0.8 });
    }
  }, [currentCoords, targetWaypoint, isOutForDelivery, followDriver, onProximityAlert]);

  const fitAllWaypoints = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      waypoints.restaurant,
      waypoints.customer,
      driverMarkerRef.current ? driverMarkerRef.current.getLatLng() : waypoints.restaurant
    ]);
    mapInstanceRef.current.fitBounds(bounds.pad(0.2));
  }, [waypoints]);

  const centerOnDriver = useCallback(() => {
    if (!mapInstanceRef.current || !driverMarkerRef.current) return;
    setFollowDriver(true);
    mapInstanceRef.current.setView(driverMarkerRef.current.getLatLng(), 16, { animate: true });
  }, []);

  const formatDistance = (meters) => {
    if (meters == null) return '--';
    if (meters < 1000) return `${meters} meters`;
    return `${(meters / 1609.34).toFixed(1)} miles`;
  };

  const estimatedMinutes = distanceToNextStop
    ? Math.max(1, Math.round(distanceToNextStop / 400)) // approx 24 km/h urban speed
    : '--';

  return (
    <div className="relative isolate rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-xl">
      {/* Top Navigation HUD Bar */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
        {/* Next Stop Waypoint Banner */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-lg flex items-center gap-2 sm:gap-2.5 pointer-events-auto min-w-0 max-w-[calc(100%-80px)] sm:max-w-none">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
            isOutForDelivery ? 'bg-blue-600' : 'bg-amber-600'
          }`}>
            <FiNavigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Next Stop: {targetLabel}
            </div>
            <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span>{formatDistance(distanceToNextStop)}</span>
              <span className="text-slate-400 dark:text-slate-500 hidden xs:inline">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">~{estimatedMinutes} min away</span>
            </div>
          </div>
        </div>

        {/* Floating Quick Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={centerOnDriver}
            title="Recenter on My Vehicle"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiCompass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={fitAllWaypoints}
            title="Fit Route to Screen"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiMaximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Geofence Proximity Alert Banner */}
      {activeGeofenceAlert && (
        <div className="absolute bottom-14 inset-x-3 z-[1000] animate-bounce pointer-events-none">
          <div className="bg-emerald-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between pointer-events-auto text-xs">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 shrink-0" />
              <span>{activeGeofenceAlert.message}</span>
            </div>
            <span className="bg-slate-950/20 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
              Geofence Active
            </span>
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-[280px] sm:h-[360px] lg:h-[440px] z-0" />

      {/* Bottom Map Info Footer */}
      <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isGpsStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-400 dark:bg-slate-600'}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isGpsStreaming ? 'Live GPS Active' : 'GPS Standby'}
          </span>
          {currentCoords && (
            <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              ({currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Kitchen (100m)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>Drop-off (75m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverNavigationMap;

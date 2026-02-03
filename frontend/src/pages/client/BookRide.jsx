import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";

import {
  createRide,
  createPaymentOrder,
  verifyPayment,
} from "../../services/ride.api";

import MapPicker from "../../components/MapPicker";

const searchAddress = async (query) => {
  if (!query || query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5`
  );

  return res.json();
};


export default function BookRide() {
  const navigate = useNavigate();

  /* ================= UI STATES ================= */
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [ride, setRide] = useState(null);

  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropMap, setShowDropMap] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  /* ================= LOCATION STATES ================= */
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); // For default map center and drivers

  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    bookingType: "distance_based",
    distance: "",
    bookingDuration: "",
    pickupAddress: "",
    dropAddress: "",
    rideType: "one-way",
    waitingTime: "",
    paymentMode: "pay_after_ride",
  });



  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= GEO HELPERS ================= */
  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name;
  };

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const generateNearbyDrivers = (lat, lng) => {
    return Array.from({ length: 5 }).map(() => ({
      lat: lat + (Math.random() - 0.5) * 0.01,
      lng: lng + (Math.random() - 0.5) * 0.01,
    }));
  };

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err.message),
        { enableHighAccuracy: true }
      );
    });


  /* ================= GET CURRENT LOCATION ================= */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to a default location, e.g., Mumbai
          setCurrentLocation({ lat: 19.0760, lng: 72.8777 });
        }
      );
    } else {
      // Fallback
      setCurrentLocation({ lat: 19.0760, lng: 72.8777 });
    }
  }, []);

  /* ================= GENERATE NEARBY DRIVERS ================= */
  useEffect(() => {
    if (showPickupMap && currentLocation) {
      const drivers = generateNearbyDrivers(
        currentLocation.lat,
        currentLocation.lng
      );
      setNearbyDrivers(drivers);
    }
  }, [showPickupMap, currentLocation]);

  useEffect(() => {
    if (pickupCoords) {
      const drivers = generateNearbyDrivers(
        pickupCoords.lat,
        pickupCoords.lng
      );
      setNearbyDrivers(drivers);
    }
  }, [pickupCoords]);

  /* ================= AUTO DISTANCE AND ROUTE ================= */
  useEffect(() => {
    if (pickupCoords && dropCoords) {
      fetchRoute(pickupCoords, dropCoords).then((route) => {
        setRouteCoords(route.coordinates);
        setEta(route.durationMin);
        setForm((f) => ({ ...f, distance: route.distanceKm }));
      });
    } else {
      setRouteCoords([]);
      setEta(null);
    }
  }, [pickupCoords, dropCoords]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!pickupCoords || !dropCoords) {
      alert("Please select pickup & drop location from map");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        bookingType: form.bookingType,
        distance:
          form.bookingType === "distance_based"
            ? Number(form.distance)
            : undefined,
        bookingDuration:
          form.bookingType === "time_based"
            ? Number(form.bookingDuration)
            : undefined,

        pickupLocation: {
          address: form.pickupAddress,
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
        },
        dropLocation: {
          address: form.dropAddress,
          lat: dropCoords.lat,
          lng: dropCoords.lng,
        },

        rideType: form.rideType,
        waitingTime:
          form.rideType === "two-way"
            ? Number(form.waitingTime)
            : 0,
        paymentMode: form.paymentMode,
      };

      const res = await createRide(payload);
      const createdRide = res.data.data;

      if (form.paymentMode === "pay_after_ride") {
        navigate(`/client/live/${createdRide._id}`);
        return;
      }

      setRide(createdRide);
      setShowPayment(true);
    } catch (err) {
      console.error(err);
      alert("Ride booking failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async (pickup, drop) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    return {
      coordinates: data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      ),
      distanceKm: (data.routes[0].distance / 1000).toFixed(2),
      durationMin: Math.ceil(data.routes[0].duration / 60),
    };
  };

  /* ================= RAZORPAY ================= */
  const handlePayment = async () => {
    if (!ride) return;

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    try {
      const orderRes = await createPaymentOrder(ride._id);
      const { orderId, amount, key } = orderRes.data.data;

      const rzp = new window.Razorpay({
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Driver Booking",
        description: "Ride Payment",
        order_id: orderId,

        handler: async (response) => {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setShowPayment(false);
          navigate(`/client/live/${ride._id}`);
        },

        modal: {
          ondismiss: () => {
            setShowPayment(false);
            alert("Payment cancelled");
          },
        },

        theme: { color: "#4f46e5" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
      <div className="max-w-xl mx-auto rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60">
        <div className="bg-[#020617] rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white mb-6">
            🚗 Book a Driver
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* BOOKING TYPE */}
            <select
              name="bookingType"
              onChange={handleChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="distance_based">Distance Based</option>
              <option value="time_based">Time Based</option>
            </select>

            {/* DISTANCE */}
            {form.bookingType === "distance_based" && (
              <input
                name="distance"
                value={form.distance}
                placeholder="Distance (km)"
                readOnly
                className="w-full rounded-xl bg-white/10 border border-white/10 text-white p-3"
              />
            )}

            {eta && (
              <p className="text-sm text-gray-400">
                ⏱️ Estimated Time: <span className="text-white">{eta} mins</span>
              </p>
            )}

            {/* TIME */}
            {form.bookingType === "time_based" && (
              <input
                name="bookingDuration"
                placeholder="Booking Duration (hours)"
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
                required
                onChange={handleChange}
              />
            )}

            {/* PICKUP */}
            <div className="relative">
              <input
                name="pickupAddress"
                value={form.pickupAddress}
                placeholder="Pickup Address"
                className="w-full p-3 rounded-xl bg-white/5 text-white"
                onChange={async (e) => {
                  const value = e.target.value;
                  setForm((f) => ({ ...f, pickupAddress: value }));

                  if (value.length > 2) {
                    const results = await searchAddress(value);
                    setPickupSuggestions(results);
                  } else {
                    setPickupSuggestions([]);
                  }
                }}
              />

              {/* 🔽 AUTOCOMPLETE */}
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-[#020617] border border-white/10 rounded-xl mt-1">
                  {pickupSuggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      onClick={() => {
                        const lat = Number(s.lat);
                        const lng = Number(s.lon);

                        setForm((f) => ({
                          ...f,
                          pickupAddress: s.display_name,
                        }));

                        setPickupCoords({ lat, lng });
                        setPickupSuggestions([]);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4 mt-1">
                <button
                  type="button"
                  onClick={() => setShowPickupMap(true)}
                  className="text-indigo-400 text-sm"
                >
                  📍 Select on map
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const { lat, lng } = await getCurrentLocation();
                      const address = await reverseGeocode(lat, lng);

                      setPickupCoords({ lat, lng });
                      setForm((f) => ({ ...f, pickupAddress: address }));
                    } catch {
                      alert("Location access denied");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-green-400 text-sm"
                >
                  📡 Use current location
                </button>
              </div>
            </div>



            {/* DROP */}
            <div className="relative">
              <input
                name="dropAddress"
                value={form.dropAddress}
                placeholder="Drop Address"
                className="w-full rounded-xl bg-white/5 text-white p-3"
                onChange={async (e) => {
                  const value = e.target.value;
                  setForm((f) => ({ ...f, dropAddress: value }));

                  if (value.length > 2) {
                    const results = await searchAddress(value);
                    setDropSuggestions(results);
                  } else {
                    setDropSuggestions([]);
                  }
                }}
              />

              {/* 🔽 AUTOCOMPLETE */}
              {dropSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-[#020617] border border-white/10 rounded-xl mt-1">
                  {dropSuggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      onClick={() => {
                        const lat = Number(s.lat);
                        const lng = Number(s.lon);

                        setForm((f) => ({
                          ...f,
                          dropAddress: s.display_name,
                        }));

                        setDropCoords({ lat, lng });
                        setDropSuggestions([]);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowDropMap(true)}
                className="text-indigo-400 text-sm mt-1"
              >
                📍 Select on map
              </button>
            </div>


            {/* RIDE TYPE */}
            <select
              name="rideType"
              onChange={handleChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="one-way">One Way</option>
              <option value="two-way">Two Way</option>
            </select>

            {form.rideType === "two-way" && (
              <input
                name="waitingTime"
                placeholder="Waiting Time (minutes)"
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
                required
                onChange={handleChange}
              />
            )}

            {/* PAYMENT */}
            <select
              name="paymentMode"
              onChange={handleChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="pay_after_ride">Pay After Ride</option>
              <option value="pay_now">Pay Now</option>
            </select>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
            >
              {loading ? "Booking..." : "Confirm Ride"}
            </button>
          </form>
        </div>
      </div>

      {/* ================= MAP MODALS ================= */}
      {showPickupMap && (
        <MapModal
          onClose={() => setShowPickupMap(false)}
          pickup={pickupCoords}
          drivers={nearbyDrivers}
          center={currentLocation} // Pass center for map
          onSelect={async ({ lat, lng }) => {
            const address = await reverseGeocode(lat, lng);
            setPickupCoords({ lat, lng });
            setForm((f) => ({ ...f, pickupAddress: address }));
            setShowPickupMap(false);
          }}
        />
      )}

      {showDropMap && (
        <MapModal
          onClose={() => setShowDropMap(false)}
          pickup={pickupCoords}
          drop={dropCoords}
          route={routeCoords}
          center={pickupCoords || currentLocation} // Center on pickup or current
          onSelect={async ({ lat, lng }) => {
            const address = await reverseGeocode(lat, lng);
            setDropCoords({ lat, lng });
            setForm((f) => ({ ...f, dropAddress: address }));
            setShowDropMap(false);
          }}
        />
      )}

      {/* ================= PAYMENT ================= */}
      {showPayment && ride && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">
              Complete Payment
            </h3>

            <p className="text-gray-400 text-sm">
              Pickup: {form.pickupAddress}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Drop: {form.dropAddress}
            </p>

            <div className="flex justify-between text-white font-semibold mb-6">
              <span>Total</span>
              <span>₹ {ride.fareBreakdown?.totalFare}</span>
            </div>

            <button
              onClick={handlePayment}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
            >
              Pay ₹{ride.fareBreakdown?.totalFare}
            </button>

            <button
              onClick={() => setShowPayment(false)}
              className="w-full mt-3 text-sm text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= MAP MODAL ================= */
function MapModal({ onSelect, onClose, pickup, drop, route, drivers = [], center }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#020617] p-4 rounded-xl w-full max-w-md">
        <MapPicker onSelect={onSelect} center={center}>
          {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
          {drop && <Marker position={[drop.lat, drop.lng]} />}

          {drivers.map((d, i) => (
            <Marker
              key={i}
              position={[d.lat, d.lng]}
              icon={L.icon({
                iconUrl:
                  "https://cdn-icons-png.flaticon.com/512/744/744465.png",
                iconSize: [30, 30],
              })}
            />
          ))}

          {route?.length > 0 && (
            <Polyline positions={route} color="#6366f1" />
          )}
        </MapPicker>

        <button
          onClick={onClose}
          className="mt-3 text-gray-400 text-sm w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
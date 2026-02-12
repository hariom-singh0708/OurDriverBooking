import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";

import {
  createRide,
  previewFare,
} from "../../services/ride.api";

import MapPicker from "../../components/MapPicker";

export default function BookRide() {
  const navigate = useNavigate();

  /* ================= UI STATES ================= */
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropMap, setShowDropMap] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  /* ================= LOCATION STATES ================= */
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null);
  const [liveFare, setLiveFare] = useState(null);

  /* ================= FORM (Payment Logic Removed) ================= */
  const [form, setForm] = useState({
    bookingType: "distance_based",
    distance: "",
    bookingDuration: "",
    pickupAddress: "",
    dropAddress: "",
    rideType: "one-way",
    waitingTime: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= GEO HELPERS ================= */
  const searchAddress = async (query) => {
    if (!query || query.length < 3) return [];
    const res = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
    );
    const data = await res.json();
    return data.map((item) => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
    }));
  };

  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`,
    );
    const data = await res.json();
    return data.display_name || "Unknown location";
  };

  const generateNearbyDrivers = (lat, lng) => {
    return Array.from({ length: 5 }).map(() => ({
      lat: lat + (Math.random() - 0.5) * 0.01,
      lng: lng + (Math.random() - 0.5) * 0.01,
    }));
  };

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err.message),
        { enableHighAccuracy: true },
      );
    });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => setCurrentLocation({ lat: 19.076, lng: 72.8777 }),
      );
    }
  }, []);

  useEffect(() => {
    if (pickupCoords)
      setNearbyDrivers(
        generateNearbyDrivers(pickupCoords.lat, pickupCoords.lng),
      );
  }, [pickupCoords]);

  useEffect(() => {
    const calculateRouteAndFare = async () => {
      if (!pickupCoords || !dropCoords) {
        setLiveFare(null);
        return;
      }

      try {
        const route = await fetchRoute(pickupCoords, dropCoords);
        setRouteCoords(route.coordinates);
        setEta(route.durationMin);

        const distanceKm = Number(route.distanceKm);

        setForm((prev) => ({
          ...prev,
          distance: distanceKm,
        }));

        const fareRes = await previewFare({
          bookingType: "distance_based",
          distance: distanceKm,
          duration: route.durationMin,
          rideType: form.rideType,
          waitingTime:
            form.rideType === "two-way"
              ? Number(form.waitingTime || 0)
              : 0,
        });

        setLiveFare(fareRes.data.data);
      } catch (err) {
        console.error("FARE PREVIEW ERROR:", err);
        setLiveFare(null);
      }
    };

    calculateRouteAndFare();
  }, [pickupCoords, dropCoords, form.rideType, form.waitingTime]);

  const fetchRoute = async (pickup, drop) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      coordinates: data.routes[0].geometry.coordinates.map(([lng, lat]) => [
        lat,
        lng,
      ]),
      distanceKm: (data.routes[0].distance / 1000).toFixed(2),
      durationMin: Math.ceil(data.routes[0].duration / 60),
    };
  };

  /* ================= SUBMIT (Now directly redirects) ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!pickupCoords || !dropCoords) {
      toast.error("Please select pickup & drop location from map");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        bookingType: form.bookingType,
        distance: form.bookingType === "distance_based" ? Number(form.distance) : undefined,
        duration: form.bookingType === "distance_based" ? Number(eta) : undefined,
        bookingDuration: form.bookingType === "time_based" ? Number(form.bookingDuration) : undefined,
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
        waitingTime: form.rideType === "two-way" ? Number(form.waitingTime) : 0,
        paymentMode: "pay_after_ride", // Hardcoded logic
      };

      const res = await createRide(payload);
      const createdRide = res.data.data;
      
      // Direct navigation to live ride
      toast.success("Booking Confirmed!");
      navigate(`/client/live/${createdRide._id}`);
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex flex-col font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Journey Config */}
          <div className="md:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100">
              <h3 className="text-xs font-black uppercase text-[#2D1B18] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand rounded-full"></span>
                Journey Configuration
              </h3>

              <div className="space-y-4">
                {/* Service Plan */}
                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Service Plan</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'service' ? null : 'service')}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 md:p-4 text-left text-xs md:text-sm font-bold text-[#2D1B18] flex justify-between items-center transition-all outline-none focus:border-brand"
                  >
                    {form.bookingType === 'distance_based' ? 'Distance Based' : 'Time Based'}
                    <svg className={`transition-transform duration-300 ${openDropdown === 'service' ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D27D56" strokeWidth="3"><path d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {openDropdown === 'service' && (
                    <div className="absolute z-[80] top-full mt-2 w-full bg-white border border-orange-100 rounded-2xl shadow-xl overflow-hidden">
                      {['distance_based', 'time_based'].map((val) => (
                        <button key={val} type="button" className="w-full text-left p-4 text-xs font-bold hover:bg-orange-50 text-[#2D1B18]"
                          onClick={() => { handleChange({ target: { name: 'bookingType', value: val } }); setOpenDropdown(null); }}>
                          {val === 'distance_based' ? 'Distance Based' : 'Time Based'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trip Type */}
                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Trip Type</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'trip' ? null : 'trip')}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 md:p-4 text-left text-xs md:text-sm font-bold text-[#2D1B18] flex justify-between items-center transition-all outline-none focus:border-brand"
                  >
                    {form.rideType === 'one-way' ? 'One Way' : 'Two Way'}
                    <svg className={`transition-transform duration-300 ${openDropdown === 'trip' ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D27D56" strokeWidth="3"><path d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {openDropdown === 'trip' && (
                    <div className="absolute z-[80] top-full mt-2 w-full bg-white border border-orange-100 rounded-2xl shadow-xl overflow-hidden">
                      {['one-way', 'two-way'].map((val) => (
                        <button key={val} type="button" className="w-full text-left p-4 text-xs font-bold hover:bg-orange-50 text-[#2D1B18]"
                          onClick={() => { handleChange({ target: { name: 'rideType', value: val } }); setOpenDropdown(null); }}>
                          {val === 'one-way' ? 'One Way' : 'Two Way'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {form.bookingType === "distance_based" ? (
                    <div className="bg-orange-50 border-2 border-brand/10 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black text-brand uppercase">Est. Logistics</p>
                        <span className="text-lg md:text-xl font-black text-[#2D1B18]">{form.distance || "0.00"} KM</span>
                      </div>
                      {eta && <span className="bg-[#2D1B18] text-white px-3 py-1 rounded-lg text-[9px] font-bold italic">⏱️ {eta} MINS</span>}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Duration (Hours)</label>
                      <input name="bookingDuration" type="number" value={form.bookingDuration} required onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 md:p-4 text-xs md:text-sm font-bold focus:border-brand outline-none" />
                    </div>
                  )}
                </div>

                {liveFare && (
                  <div className="mt-4 bg-[#2D1B18] text-white p-4 rounded-2xl">
                    <p className="text-[9px] uppercase font-black tracking-widest opacity-70">Estimated Fare</p>
                    <h4 className="text-2xl font-black">₹ {liveFare.totalFare}</h4>
                  </div>
                )}
              </div>
            </section>

            {form.rideType === "two-way" && (
              <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Waiting Time (Mins)</label>
                  <input name="waitingTime" type="number" value={form.waitingTime} onChange={handleChange} placeholder="Mins" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 md:p-4 text-xs md:text-sm font-bold outline-none focus:border-brand" />
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Route & Confirmation */}
          <div className="md:col-span-8 space-y-6">
            <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-orange-100 h-full flex flex-col relative">
              <h3 className="text-xs font-black uppercase text-[#2D1B18] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand rounded-full"></span>
                Route Specification
              </h3>

              <div className="space-y-6 flex-1">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Origin Address</label>
                  <input value={form.pickupAddress} placeholder="Enter pickup location..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs md:text-sm font-bold focus:border-brand outline-none"
                    onChange={async (e) => {
                      setForm({ ...form, pickupAddress: e.target.value });
                      if (e.target.value.length > 2) setPickupSuggestions(await searchAddress(e.target.value));
                      else setPickupSuggestions([]);
                    }} />
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute z-[70] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl mt-2 overflow-hidden">
                      {pickupSuggestions.map(s => (
                        <button key={s.place_id} type="button" className="w-full text-left p-4 text-xs hover:bg-orange-50 font-bold border-b border-slate-50"
                          onClick={() => { setForm({ ...form, pickupAddress: s.display_name }); setPickupCoords({ lat: s.lat, lng: s.lon }); setPickupSuggestions([]); }}>
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 mt-2 px-1">
                    <button type="button" onClick={() => setShowPickupMap(true)} className="text-[10px] font-black text-brand uppercase tracking-widest transition-colors">📍 Pick on Map</button>
                    <button type="button" onClick={async () => {
                      setLoading(true);
                      try {
                        const { lat, lng } = await getCurrentLocation();
                        const addr = await reverseGeocode(lat, lng);
                        setPickupCoords({ lat, lng }); setForm({ ...form, pickupAddress: addr });
                      } finally { setLoading(false); }
                    }} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest transition-colors">📡 Current Location</button>
                  </div>
                </div>

                <div className="relative pt-4">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Destination Address</label>
                  <input value={form.dropAddress} placeholder="Where are you going?" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs md:text-sm font-bold focus:border-brand outline-none"
                    onChange={async (e) => {
                      setForm({ ...form, dropAddress: e.target.value });
                      if (e.target.value.length > 2) setDropSuggestions(await searchAddress(e.target.value));
                      else setDropSuggestions([]);
                    }} />
                  {dropSuggestions.length > 0 && (
                    <div className="absolute z-[70] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl mt-2 overflow-hidden">
                      {dropSuggestions.map(s => (
                        <button key={s.place_id} type="button" className="w-full text-left p-4 text-xs hover:bg-orange-50 font-bold border-b border-slate-50"
                          onClick={() => { setForm({ ...form, dropAddress: s.display_name }); setDropCoords({ lat: s.lat, lng: s.lon }); setDropSuggestions([]); }}>
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={() => setShowDropMap(true)} className="text-[10px] font-black text-brand uppercase tracking-widest mt-2 px-1 transition-colors">📍 Pick on Map</button>
                </div>
              </div>

              {/* MAP PREVIEW MODAL */}
              {(showPickupMap || showDropMap) && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[90%] md:w-full max-w-[320px] bg-white p-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(45,27,24,0.3)] border border-slate-100">
                  <div className="h-48 md:h-64 w-full rounded-[2rem] overflow-hidden border border-slate-50">
                    <MapPicker onSelect={showPickupMap ? async ({ lat, lng }) => {
                      const addr = await reverseGeocode(lat, lng);
                      setPickupCoords({ lat, lng }); setForm({ ...form, pickupAddress: addr }); setShowPickupMap(false);
                    } : async ({ lat, lng }) => {
                      const addr = await reverseGeocode(lat, lng);
                      setDropCoords({ lat, lng }); setForm({ ...form, dropAddress: addr }); setShowDropMap(false);
                    }} center={currentLocation}>
                      {pickupCoords && <Marker position={[pickupCoords.lat, pickupCoords.lng]} />}
                      {dropCoords && <Marker position={[dropCoords.lat, dropCoords.lng]} />}
                      {nearbyDrivers.map((d, i) => (
                        <Marker key={i} position={[d.lat, d.lng]} icon={L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png", iconSize: [20, 20] })} />
                      ))}
                      {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#D27D56" weight={5} />}
                    </MapPicker>
                  </div>
                  <button onClick={() => { setShowPickupMap(false); setShowDropMap(false); }} className="w-full pt-3 pb-1 text-[10px] font-black uppercase text-[#2D1B18] tracking-widest">Close Preview</button>
                </div>
              )}

              <div className="mt-8 flex flex-col items-center">
                <div className="w-full max-w-sm">
                  <button disabled={loading} type="submit" className="w-full bg-brand hover:bg-[#2D1B18] text-white py-4 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-[0.96] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing...</span></> : "Confirm Booking"}
                  </button>
                  <div className="flex flex-col items-center mt-4 space-y-1">
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Instant Assignment Active</p>
                    <p className="text-center text-[8px] text-slate-300 uppercase font-medium tracking-widest">Ride will start upon driver arrival</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
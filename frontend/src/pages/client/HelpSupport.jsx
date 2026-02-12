import { useEffect, useState } from "react";
import axios from "axios";
import { 
  LifeBuoy, 
  CreditCard, 
  Car, 
  User, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  Send,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function HelpSupport() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchMyTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/support/client`, authHeader);
      setTickets(res.data.data || []);
    } catch {
      console.log("Unable to load support tickets");
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !message.trim()) {
      toast.error("Please select category and describe your issue");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/support/client`,
        { category, message },
        authHeader
      );
      toast.success("Your request has been submitted. Our team will contact you soon.");
      setCategory("");
      setMessage("");
      fetchMyTickets();
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryHint = () => {
    switch (category) {
      case "Payment": return "Wallet, fare, refund or payment failure.";
      case "Ride": return "Issues with driver, route, or timing.";
      case "Account": return "Profile, login, or security settings.";
      default: return "Select a category to see specific guidance.";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2421] pb-24 selection:bg-[#BC6641]/10">
      
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 space-y-10">

        {/* ================= HEADER ================= */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-12 bg-[#BC6641]"></span>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BC6641]">Concierge Support</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-light leading-tight">
            How can we <br />
            <span className="italic font-medium text-[#BC6641]">assist you?</span>
          </h1>
          <p className="text-[#8E817C] text-lg font-light max-w-xl">
            Our specialized team is here to ensure your journey remains seamless. 
            Choose a category below to initiate a priority request.
          </p>
        </header>

        {/* ================= QUICK CATEGORIES ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CategoryCard icon={<CreditCard size={20}/>} title="Payment" text="Fare & Refunds" />
          <CategoryCard icon={<Car size={20}/>} title="Ride" text="Driver & Routes" />
          <CategoryCard icon={<User size={20}/>} title="Account" text="Access & Safety" />
        </div>

        {/* ================= CONTENT GRID ================= */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            {/* USER GUIDE */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#F4E9E2] shadow-sm">
              <h2 className="text-2xl font-serif italic mb-8">Traveler's Guide</h2>
              <div className="space-y-6">
                <GuideStep step="01" title="Initiate Booking" text="Enter locations via 'Book Ride' and view automated fare calculation." />
                <GuideStep step="02" title="Confirm Chauffeur" text="Confirm your request to alert nearby elite drivers." />
                <GuideStep step="03" title="Live Tracking" text="Monitor your driver's arrival in real-time on your encrypted map." />
                <GuideStep step="04" title="Finalize & Rate" text="Complete the journey and rate the experience to maintain our standards." />
              </div>
            </section>

            {/* GUIDELINES */}
            <section className="bg-[#2D2421] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="text-[#BC6641]" size={24} />
                <h2 className="text-xl font-serif italic">Safety & Protocol</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4 text-sm font-light text-white/70">
                  <span className="text-[#BC6641] font-bold">•</span>
                  Ensure pickup locations are accurate to maintain concierge timing.
                </li>
                <li className="flex gap-4 text-sm font-light text-white/70">
                  <span className="text-[#BC6641] font-bold">•</span>
                  Keep communication lines open for chauffeur arrival.
                </li>
                <li className="flex gap-4 text-sm font-light text-white/70">
                  <span className="text-[#BC6641] font-bold">•</span>
                  Use the <b className="text-white">SOS feature</b> during active trips for emergencies.
                </li>
              </ul>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {/* SUPPORT FORM */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-[#F4E9E2] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <LifeBuoy size={80} />
              </div>
              <h2 className="text-xl font-serif italic mb-6">Raise Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#BC6641] ml-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 rounded-2xl bg-[#FAF8F6] border border-[#F4E9E2] px-4 text-sm font-bold text-[#2D2421] focus:outline-none focus:border-[#BC6641] appearance-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Payment">Payment</option>
                    <option value="Ride">Ride</option>
                    <option value="Account">Account</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="px-3 py-2 bg-[#FAF6F4] rounded-xl border border-[#F4E9E2]">
                  <p className="text-[10px] text-[#8E817C] font-medium leading-tight italic">
                    {getCategoryHint()}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#BC6641] ml-2">Description</label>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the nature of the issue..."
                    className="w-full rounded-2xl bg-[#FAF8F6] border border-[#F4E9E2] p-4 text-sm text-[#2D2421] font-medium focus:outline-none focus:border-[#BC6641] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-[#BC6641] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[#BC6641]/20 hover:bg-[#A35232] transition-all active:scale-[0.98]"
                >
                  {loading ? "Processing..." : "Submit Inquiry"}
                </button>
              </form>
            </section>

            {/* RESPONSE INFO */}
            <div className="p-6 bg-[#FAF8F6] rounded-3xl border border-[#F4E9E2] flex gap-4">
              <Clock className="text-[#BC6641] shrink-0" size={20} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2D2421]">Response Time</p>
                <p className="text-xs text-[#8E817C] mt-1 font-medium italic">Our average response time for premium members is 24 hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MY TICKETS ================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif italic">My Inquiries</h2>
            <div className="h-[1px] flex-1 bg-[#F4E9E2]" />
          </div>

          {tickets.length === 0 ? (
            <div className="py-20 text-center bg-white/50 border-2 border-dashed border-[#EBD9D0] rounded-[3rem]">
              <HelpCircle className="mx-auto mb-4 text-[#EBD9D0]" size={40} />
              <p className="text-[#8E817C] font-serif italic text-lg">No support inquiries found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((t) => (
                <TicketItem key={t._id} ticket={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= REFINED COMPONENTS ================= */

function CategoryCard({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#F4E9E2] group hover:border-[#BC6641]/30 transition-all shadow-sm">
      <div className="h-10 w-10 bg-[#FAF6F4] text-[#BC6641] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#BC6641] group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-[#2D2421]">{title}</h3>
      <p className="text-xs text-[#8E817C] mt-1 font-medium">{text}</p>
    </div>
  );
}

function GuideStep({ step, title, text }) {
  return (
    <div className="flex gap-6 group">
      <span className="text-3xl font-serif italic text-[#BC6641]/20 group-hover:text-[#BC6641] transition-colors">{step}</span>
      <div className="space-y-1 pt-2">
        <h4 className="text-sm font-bold text-[#2D2421] uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-[#8E817C] leading-relaxed font-light">{text}</p>
      </div>
    </div>
  );
}

function TicketItem({ ticket }) {
  const isResolved = ticket.status === "RESOLVED";
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#F4E9E2] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#BC6641]">{ticket.category}</span>
          <p className="text-[9px] text-[#8E817C] font-bold mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
          isResolved ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-[#FAF6F4] text-[#BC6641] border-[#F4E9E2]"
        }`}>
          {ticket.status === "OPEN" ? "PENDING" : ticket.status}
        </span>
      </div>
      <p className="text-sm text-[#2D2421] font-medium leading-relaxed italic">"{ticket.message}"</p>
    </div>
  );
}
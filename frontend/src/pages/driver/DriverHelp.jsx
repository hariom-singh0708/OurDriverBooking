import { useEffect, useState } from "react";
import axios from "axios";
import { 
  LifeBuoy, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  UserCheck,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function DriverHelp() {
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
      const res = await axios.get(`${API_URL}/support/driver`, authHeader);
      setTickets(res.data.data || []);
    } catch {
      console.log("Failed to load tickets");
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
      await axios.post(`${API_URL}/support/driver`, { category, message }, authHeader);
      toast.success("Support request submitted successfully");
      setCategory("");
      setMessage("");
      fetchMyTickets();
    } catch {
      toast.error("Failed to submit support request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2421] pb-24 selection:bg-[#BC6641]/10">
      {/* Visual Grain Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 space-y-12">
        
        {/* ================= HEADER ================= */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-12 bg-[#BC6641]"></span>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BC6641]">Driver Command Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-none tracking-tight">
            Partner <span className="italic font-medium text-[#BC6641]">Resources</span>
          </h1>
          <p className="text-[#8E817C] text-lg font-light max-w-2xl leading-relaxed">
            Access elite operational guidelines, payout protocols, and direct priority support.
          </p>
        </header>

        {/* ================= CONTENT GRID ================= */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* LEFT: OPERATIONAL GUIDES */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* WORKFLOW GUIDE */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#F4E9E2] shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 bg-[#FAF6F4] rounded-2xl flex items-center justify-center text-[#BC6641]">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl font-serif italic">Operational Protocol</h2>
              </div>
              
              <div className="space-y-8 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-[#BC6641] via-[#EBD9D0] to-transparent"></div>
                <GuideStep num="01" title="Active Status" text="Toggle your status to ONLINE. Stay ready for incoming high-priority requests." />
                <GuideStep num="02" title="Rapid Acceptance" text="Requests are time-sensitive. Accept within the window to secure your booking." />
                <GuideStep num="03" title="Precision Navigation" text="Head to pickup and keep coordinates updated for the client's live view." />
                <GuideStep num="04" title="Excellence Review" text="Finalize trip and confirm payment. Professional behavior ensures top-tier ratings." />
              </div>
            </section>

            {/* CRITICAL GUIDELINES */}
            <section className="bg-[#2D2421] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck size={100} />
              </div>
              <div className="flex items-center gap-3 mb-8">
                <AlertTriangle className="text-[#BC6641]" size={24} />
                <h2 className="text-xl font-serif italic">Critical Mandates</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] font-medium tracking-tight text-white/70 uppercase">
                <p className="flex items-start gap-2"><span className="text-[#BC6641]">•</span> Maintain active GPS & Data</p>
                <p className="flex items-start gap-2"><span className="text-[#BC6641]">•</span> Professional conduct at all times</p>
                <p className="flex items-start gap-2"><span className="text-[#BC6641]">•</span> Validate vehicle documentation</p>
                <p className="flex items-start gap-2"><span className="text-[#BC6641]">•</span> Use SOS only for emergencies</p>
              </div>
            </section>
          </div>

          {/* RIGHT: ACTION HUB */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* SUPPORT FORM */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#F4E9E2] shadow-xl shadow-[#BC6641]/5">
              <div className="flex items-center gap-3 mb-8">
                <Zap className="text-[#BC6641]" size={20} />
                <h2 className="text-xl font-serif italic">Priority Inquiry</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#BC6641] ml-2">Topic</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 rounded-2xl bg-[#FAF8F6] border border-[#F4E9E2] px-5 text-sm font-bold text-[#2D2421] focus:outline-none focus:border-[#BC6641] appearance-none"
                  >
                    <option value="">Choose Category</option>
                    <option value="Payment">Payment / Payout</option>
                    <option value="Ride">Ride Issue</option>
                    <option value="Account">Account / KYC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#BC6641] ml-2">Message</label>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your request clearly..."
                    className="w-full rounded-2xl bg-[#FAF8F6] border border-[#F4E9E2] p-5 text-sm text-[#2D2421] font-medium focus:outline-none focus:border-[#BC6641] resize-none placeholder:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-[1.5rem] bg-[#BC6641] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[#BC6641]/20 hover:bg-[#A35232] transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Send size={16} /> {loading ? "Relaying..." : "Transmit Request"}
                </button>
              </form>
            </section>

            {/* SERVICE STATS */}
            <div className="bg-[#FAF8F6] rounded-3xl p-6 border border-[#F4E9E2] flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#BC6641] shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2D2421]">Expected Response</p>
                <p className="text-xs text-[#8E817C] font-medium italic">Priority queue: ~24 Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MY TICKETS ================= */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-serif italic">Archive of Logs</h2>
            <div className="h-[1px] flex-1 bg-[#F4E9E2]"></div>
          </div>

          {tickets.length === 0 ? (
            <div className="py-20 text-center bg-white/40 border-2 border-dashed border-[#EBD9D0] rounded-[3rem]">
              <p className="text-[#8E817C] font-serif italic text-lg">No past inquiries found in your ledger.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((t) => (
                <div key={t._id} className="group bg-white rounded-3xl p-8 border border-[#F4E9E2] hover:border-[#BC6641]/30 transition-all hover:shadow-xl shadow-[#BC6641]/5">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#BC6641]">{t.category}</span>
                      <p className="text-[9px] text-[#8E817C] font-bold mt-1 uppercase tracking-tighter">
                        Log Entry: {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                      t.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-[#FAF6F4] text-[#BC6641] border-[#F4E9E2]"
                    }`}>
                      {t.status === "OPEN" ? "PENDING" : t.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#2D2421] font-medium leading-relaxed italic opacity-80">"{t.message}"</p>
                  <div className="mt-6 flex items-center justify-end">
                    <ChevronRight size={14} className="text-[#EBD9D0] group-hover:text-[#BC6641] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENT HELPERS ================= */

function GuideStep({ num, title, text }) {
  return (
    <div className="flex gap-6 group">
      <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-[#BC6641] flex items-center justify-center text-[10px] font-black text-[#BC6641] group-hover:bg-[#BC6641] group-hover:text-white transition-all">
        {num}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold uppercase tracking-tight text-[#2D2421]">{title}</h4>
        <p className="text-xs text-[#8E817C] font-light leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
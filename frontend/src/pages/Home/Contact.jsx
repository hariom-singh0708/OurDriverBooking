import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone } from "lucide-react";
import Footer from "./Footer";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, form);
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
              <>

    <div className="bg-white font-sans text-gray-900 min-h-screen pb-6">
      {/* ================= HEADER SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-4 md:pt-8 pb-4 md:pb-6">
        <span className="text-[#D9933F] font-semibold text-base md:text-lg">Contact Us</span>
        <h1 className="text-3xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
          Get in Touch with Our Team
        </h1>
        <p className="text-gray-600 max-w-2xl text-sm md:text-base leading-relaxed">
          We're here to answer your questions, discuss your project, and help you find the best solutions for your needs.
          Reach out to us, and let's start building something great together.
        </p>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: THE FORM CARD */}
          <div className="w-full lg:flex-1 bg-[#FDFBF7]   rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-sm shadow-amber-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">We'd love to hear from you!</h2>
            <p className="text-lg md:text-xl font-medium text-gray-700 mt-1 mb-8">Let's get in touch</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D9933F]/20 focus:border-[#D9933F] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D9933F]/20 focus:border-[#D9933F] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D9933F]/20 focus:border-[#D9933F] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your project..."
                  className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D9933F]/20 focus:border-[#D9933F] transition-all resize-none"
                  required
                ></textarea>
              </div>

              {success && <p className="text-green-600 text-sm font-bold animate-pulse">{success}</p>}
              {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-max px-12 py-4 bg-[#D9933F] hover:bg-[#c48235] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#D9933F]/20 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: CONTACT INFO & MAP */}
          <div className="w-full lg:w-[380px] space-y-8">
            <div className="px-2">
              <h3 className="text-2xl font-bold mb-6">Prefer a Direct Approach?</h3>
             <div className="space-y-5">
  {/* 📞 Phone */}
  <a
    href="tel:+9188882222"
    className="flex items-center gap-4 text-gray-700 group"
  >
    <div className="p-3 bg-[#FEF9F2] rounded-lg group-hover:bg-[#D9933F] group-hover:text-white transition-colors">
      <Phone size={20} />
    </div>
    <span className="text-sm md:text-base font-semibold">
      +91 8888 2222
    </span>
  </a>

  {/* ✉️ Email */}
  <a
    href="mailto:info-example@gmail.com"
    className="flex items-center gap-4 text-gray-700 group"
  >
    <div className="p-3 bg-[#FEF9F2] rounded-lg group-hover:bg-[#D9933F] group-hover:text-white transition-colors">
      <Mail size={20} />
    </div>
    <span className="text-sm md:text-base font-semibold">
      info-example@gmail.com
    </span>
  </a>
</div>

            </div>

            {/* MAP CONTAINER */}
            <div className="border border-[#F3E6D5] rounded-[2rem] p-2 bg-white shadow-sm overflow-hidden">
              <div className="w-full h-64 md:h-72 rounded-[1.8rem] overflow-hidden">
                <iframe
                  title="Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115132.86107223247!2d85.07300223783633!3d25.608020853760443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed5842f03f77a5%3A0xfa6ff3966fa04910!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* LOCATION CARD */}
            <div className="bg-[#FEF9F2] border border-[#F3E6D5] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#D9933F] uppercase tracking-[0.2em] mb-1">Regional Office</p>
              <p className="text-base font-bold text-gray-800">PATNA, BIHAR, INDIA</p>
            </div>
          </div>

        </div>
      </section>
    </div>
          <Footer />
          </>
    
  );
}
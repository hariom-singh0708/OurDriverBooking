import { Link } from "react-router-dom";
import {
  Car,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Mail,
  Phone,
  Globe,
  MapPin
} from "lucide-react";
import footerCar from "../../assets/footerCar.png";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "#" },
  { Icon: Youtube, href: "#" },
  { Icon: Twitter, href: "#" },
  { Icon: Instagram, href: "#" },
];

const COMPANY_LINKS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Privacy Policy", path: "/policy" },
  { name: "Refund Policy", path: "/refund-policy" },
  { name: "Terms of Service", path: "/terms-of-service" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">

      {/* ===== BACKGROUND LAYERS ===== */}
      <div
        className="absolute inset-0 bg-no-repeat opacity-80 transition-opacity duration-700 hover:opacity-30"
        style={{
          backgroundImage: `url(${footerCar})`,
          backgroundSize: "800px",
          backgroundPosition: "-100px center"
        }}
      />

      {/* Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px"
        }}
      />

      {/* Gradient Mask for Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Brand & Social */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-[#d28a32] flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-[#d28a32]/20">
                <Car size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Driver<span className="text-[#d28a32]">Booking</span>
              </h2>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Experience premium chauffeur services with just a few clicks.
              Reliable, safe, and professional drivers at your doorstep.
            </p>

            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="h-10 w-10 rounded-lg bg-white/5 border border-white/10
                           flex items-center justify-center transition-all duration-300
                           hover:bg-[#d28a32] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#d28a32]/30"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-8 relative inline-block">
              Company
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#d28a32] rounded-full" />
            </h4>
            <ul className="grid grid-cols-2 gap-4">
              {COMPANY_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#d28a32] text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-[#d28a32] transition-all group-hover:w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-8 relative inline-block">
              Get In Touch
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#d28a32] rounded-full" />
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <div className="text-[#d28a32]"><Phone size={18} /></div>
                <span>(406) 550-6708</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-[#d28a32]"><Mail size={18} /></div>
                <span>support@driverbooking.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-[#d28a32]"><MapPin size={18} /></div>
                <span>56, Surat, Ahmedabad, Gujarat</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Map */}
          <div className="flex flex-col">
            <h4 className="text-lg font-bold mb-8 relative inline-block">
              Our Location
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#d28a32] rounded-full" />
            </h4>
            <div className="rounded-2xl overflow-hidden border mt-1 border-white/10 h-40 w-full group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7196.991652594354!2d85.17278146730197!3d25.588435317566915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1770789719627!5m2!1sen!2sin"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
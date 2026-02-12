import { useEffect } from "react";

export default function TermsOfService() {
  
  // Navigation: Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FBF9F6] font-sans text-stone-800">

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[32rem] w-[32rem] bg-[#C05D38]/15 blur-[160px] rounded-full" />
        
        {/* Changed py-24 to py-3 */}
        <div className="relative max-w-5xl mx-auto px-6 py-3 text-center">
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
            Legal
          </span>

          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
            Terms of Service
          </h1>

          <p className="mt-3 max-w-2xl mx-auto text-stone-600 leading-relaxed text-xs md:text-sm">
            These terms govern your access to and use of the DriverBook platform.
            By using our services, you agree to these terms.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      {/* Reduced pb-28 to pb-10 for a tighter look */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-stone-100 shadow-sm space-y-8">

          <Section title="1. Acceptance of Terms">
            By accessing or using DriverBook, you confirm that you have read,
            understood, and agreed to these Terms of Service.
          </Section>

          <Section title="2. Services Overview">
            DriverBook provides driver booking, ride management, payments,
            tracking, and related mobility services through its platform.
          </Section>

          <Section title="3. User Responsibilities">
            You agree to:
            <ul className="list-disc pl-5 mt-3 space-y-1 text-xs md:text-sm">
              <li>Provide accurate and complete information</li>
              <li>Use the platform only for lawful purposes</li>
              <li>Respect drivers, clients, and platform policies</li>
            </ul>
          </Section>

          <Section title="5. Payments & Charges">
            All fares, fees, and charges are clearly displayed before booking.
            Payments must be completed using approved payment methods.
          </Section>

          <Section title="7. Limitation of Liability">
            DriverBook is not liable for indirect, incidental, or consequential
            damages arising from the use of our services.
          </Section>

          <Section title="10. Contact">
            For questions regarding these terms, contact us at:
            <p className="mt-2 font-bold text-[#C05D38] text-sm">
              support@driverbook.com
            </p>
          </Section>

          <div className="pt-6 border-t border-stone-100 flex justify-between items-center flex-wrap gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Last updated: {new Date().toLocaleDateString("en-IN")}
            </p>
            <p className="text-[10px] font-black text-[#C05D38] uppercase tracking-widest">
              © DriverBook Premium
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPACT COMPONENT ================= */

function Section({ title, children }) {
  return (
    <div className="group">
      <h2 className="text-base md:text-lg font-black tracking-tight mb-2 text-stone-800 flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C05D38]" />
        {title}
      </h2>
      <div className="text-stone-500 leading-relaxed text-sm pl-4">
        {children}
      </div>
    </div>
  );
}
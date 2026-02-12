import { useEffect } from "react";

export default function PrivacyPolicy() {
  // Navigation: Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FBF9F6] min-h-screen font-sans text-stone-800">

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[32rem] w-[32rem] bg-[#C05D38]/12 blur-[160px] rounded-full" />
        
        {/* Reduced py-24 to py-6 */}
        <div className="relative max-w-5xl mx-auto px-6 py-6 text-center">
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
            Legal
          </span>

          <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-xl mx-auto text-stone-600 leading-relaxed text-sm">
            We are committed to protecting your privacy and personal information.
            This policy explains how your data is collected, used, and safeguarded.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      {/* Reduced pb-28 to pb-12 for better flow */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-stone-100 shadow-sm space-y-8">

          <PolicyBlock title="1. Introduction">
            This Privacy Policy describes how <b>DriverBook</b> (“we”, “our”, “us”)
            collects, uses, and protects your information when you access or use
            our platform and services.
          </PolicyBlock>

          <PolicyBlock title="2. Information We Collect">
            We may collect the following categories of information:
            <ul className="list-disc pl-5 mt-3 space-y-1 text-xs md:text-sm">
              <li>Personal identifiers (name, phone number, email)</li>
              <li>Ride details, trip history, and location data</li>
              <li>Payment and transaction information</li>
              <li>Support tickets and communication records</li>
            </ul>
          </PolicyBlock>

          <PolicyBlock title="3. How We Use Your Information">
            Information is used to:
            <ul className="list-disc pl-5 mt-3 space-y-1 text-xs md:text-sm">
              <li>Operate and improve our services</li>
              <li>Process bookings, payments, and settlements</li>
              <li>Ensure platform safety and fraud prevention</li>
              <li>Respond to customer support requests</li>
            </ul>
          </PolicyBlock>

          <PolicyBlock title="4. Data Sharing">
            We do not sell personal data. Information is shared only with verified 
            drivers to complete services or to comply with legal obligations.
          </PolicyBlock>

          <PolicyBlock title="5. Data Security">
            We use industry-standard security measures to protect your data. 
            Despite safeguards, no system can be guaranteed 100% secure.
          </PolicyBlock>

          <PolicyBlock title="6. Your Rights">
            You have the right to access, review, and request correction or 
            deletion of your personal data, subject to legal limits.
          </PolicyBlock>

          <PolicyBlock title="9. Contact Information">
            If you have any questions or concerns regarding this policy, contact:
            <p className="mt-2 font-bold text-[#C05D38] text-sm">
              support@driverbook.com
            </p>
          </PolicyBlock>

          {/* Footer meta */}
          <div className="pt-6 border-t border-stone-100 text-[10px] font-bold uppercase tracking-widest text-stone-400 flex justify-between flex-wrap gap-4">
            <span>
              Last updated: {new Date().toLocaleDateString("en-IN")}
            </span>
            <span className="italic">
              © DriverBook Premium
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPACT COMPONENT ================= */

function PolicyBlock({ title, children }) {
  return (
    <div className="relative pl-6">
      {/* Accent line */}
      <div className="absolute left-0 top-1.5 h-full w-[2px] rounded-full bg-[#C05D38]/30" />

      <h2 className="text-base md:text-lg font-black tracking-tight mb-2 text-stone-800">
        {title}
      </h2>

      <div className="text-sm text-stone-500 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
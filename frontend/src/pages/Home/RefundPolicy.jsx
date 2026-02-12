import { useEffect } from "react";

export default function RefundPolicy() {
  
  // Navigation: Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FBF9F6] min-h-screen font-sans text-stone-800">

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[32rem] w-[32rem] bg-[#C05D38]/12 blur-[160px] rounded-full" />
        
        {/* Changed py-24 to py-4 */}
        <div className="relative max-w-5xl mx-auto px-6 py-4 text-center">
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
            Policy
          </span>

          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
            Refund & Cancellation
          </h1>

          <p className="mt-3 max-w-xl mx-auto text-stone-600 leading-relaxed text-xs md:text-sm">
            This policy explains how ride cancellations and refunds are handled
            on the DriverBook platform.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      {/* Reduced pb-28 to pb-10 */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-stone-100 shadow-sm space-y-8">

          <Section title="1. Ride Cancellations by Client">
            Clients may cancel a ride before the driver arrives. Cancellation
            charges, if any, will be clearly displayed in the app at the time of cancellation.
          </Section>

          <Section title="2. Ride Cancellations by Driver">
            If a driver cancels or fails to arrive, the client may be eligible
            for a full refund or immediate ride credit to their account.
          </Section>

          <Section title="3. Refund Eligibility">
            Refunds may be issued in cases of:
            <ul className="list-disc pl-5 mt-3 space-y-1 text-xs md:text-sm">
              <li>Driver no-show at pickup location</li>
              <li>Incorrect fare calculation or overcharging</li>
              <li>Service disruption due to technical system errors</li>
            </ul>
          </Section>

          <Section title="4. Refund Processing Time">
            Approved refunds are processed within **5–7 business days** and 
            credited back to the original payment method used.
          </Section>

          <Section title="5. Non-Refundable Scenarios">
            Refunds will not be issued for:
            <ul className="list-disc pl-5 mt-3 space-y-1 text-xs md:text-sm">
              <li>Completed rides after successful drop-off</li>
              <li>Cancellations made after the driver has arrived</li>
              <li>Accounts suspended for policy violations</li>
            </ul>
          </Section>

          <Section title="8. Contact Support">
            For refund or cancellation inquiries, contact:
            <p className="mt-2 font-bold text-[#C05D38] text-sm">
              support@driverbook.com
            </p>
          </Section>

          {/* Footer Metadata */}
          <div className="pt-6 border-t border-stone-100 flex justify-between items-center flex-wrap gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Last updated: {new Date().toLocaleDateString("en-IN")}
            </p>
            <p className="text-[10px] font-black text-[#C05D38] uppercase tracking-widest">
              © DriverBook Operations
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
    <div>
      <h2 className="text-base md:text-lg font-black tracking-tight mb-2 text-stone-800 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C05D38]" />
        {title}
      </h2>
      <div className="text-stone-500 leading-relaxed text-sm pl-4">
        {children}
      </div>
    </div>
  );
}
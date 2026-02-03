export default function ChoiceSection({ leftImage, smallImage }) {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-stone-800 relative inline-block">
            SERVICES
            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#C05D38]"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side with "Floating" Effect */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={leftImage}
                alt="Professional Driver"
                className="h-[500px] w-full object-cover"
              />
            </div>
            {/* Small floating stat or badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
              <p className="text-[#C05D38] font-bold text-2xl">10+ Years</p>
              <p className="text-stone-500 text-xs uppercase font-bold">Experience</p>
            </div>
          </div>

          {/* Text Content Side */}
          <div className="space-y-6">
            <h3 className="text-4xl font-extrabold text-stone-900 leading-tight">
              Your first choice for <br /> traveling anywhere
            </h3>
            
            <p className="text-lg text-stone-600 leading-relaxed">
              Move through your city with comfort, speed, and complete confidence. 
              Our fleet is maintained to the highest standards.
            </p>

            {/* Service Highlight Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-stone-100 bg-[#F9F6F0]">
              <div className="h-12 w-12 rounded-full bg-[#C05D38] flex items-center justify-center text-white">
                ✓
              </div>
              <div>
                <p className="font-bold text-stone-800">High Quality Service</p>
                <p className="text-sm text-stone-500">Professional drivers only</p>
              </div>
            </div>

            {/* Contact Row */}
            <div className="pt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-stone-900 flex items-center justify-center text-white shadow-lg">
                <span className="text-xl">📞</span>
              </div>
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Call us now!</p>
                <p className="text-xl font-black text-stone-900">111 222 8888</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
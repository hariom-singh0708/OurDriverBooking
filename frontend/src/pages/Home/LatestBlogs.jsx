import { ArrowUpRight, Clock } from "lucide-react";

const blogs = [
  {
    title: "Choosing the Best Taxi App for Your Needs",
    author: "admin",
    date: "Oct 23, 2025",
    category: "Guides",
    image: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Premium Experience for Business Travel",
    author: "Isha Singh",
    date: "Oct 20, 2025",
    category: "Corporate",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Why Professional Drivers Matter Today",
    author: "admin",
    date: "Oct 18, 2025",
    category: "Safety",
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=600&q=80",
  },
];

export default function LatestBlogs() {
  return (
    <section className="bg-[#FDF9F6] py-4 md:py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-12 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-2">
              Blogs and News
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#432C2B]">
              Our Latest <span className="text-brand">Blogs & News</span>
            </h2>
          </div>
          
          {/* <button className="self-start sm:self-auto text-[10px] font-black uppercase tracking-widest text-[#432C2B] border-b border-brand pb-1 hover:text-brand transition-all">
            View All Posts
          </button> */}
        </div>

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <article 
              key={index} 
              className="group cursor-pointer bg-white p-3 sm:p-2 rounded-2xl
              border border-[#E8D9D2]/30 hover:border-brand/50
              transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-52 sm:h-44 overflow-hidden rounded-xl mb-4">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 backdrop-blur-md text-brand
                  text-[8px] font-black uppercase px-2 py-1 rounded-md">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-2 pb-2">
                <div className="flex items-center gap-3 mb-2
                text-[10px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-tight">
                  <span>{blog.date}</span>
                  <div className="w-1 h-1 rounded-full bg-stone-200" />
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> 3 min
                  </span>
                </div>

                <h3 className="text-[15px] sm:text-[14px] font-bold text-[#432C2B]
                leading-tight group-hover:text-brand transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[9px] font-bold text-stone-400">
                    By {blog.author}
                  </span>
                  <div className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

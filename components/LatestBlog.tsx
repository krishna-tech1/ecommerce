import React from "react";
import Title from "./Title";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Image from "next/image";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const LatestBlog = async () => {
  const recentBlogs = await db
    .select()
    .from(blogs)
    .orderBy(desc(blogs.publishedAt))
    .limit(4);

  if (recentBlogs.length === 0) return null;

  return (
    <div className="mb-10 lg:mb-20">
      <div className="flex items-center justify-between mb-6">
        <Title className="text-xl font-bold text-slate-800">Latest from our Blog</Title>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-xs md:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 underline underline-offset-4"
        >
          View all articles <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentBlogs.map((blog) => (
          <div key={blog.id} className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
            <Link href={`/blog/${blog.slug}`} className="block relative h-48 w-full overflow-hidden bg-slate-50">
              <Image
                src={blog.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"}
                alt={blog.title || "blog"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-3 mb-3">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {blog.category || "General"}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} />
                    {formatDate(blog.publishedAt)}
                  </span>
                </div>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="text-sm font-extrabold tracking-tight text-slate-800 hover:text-emerald-600 block line-clamp-2 transition-colors duration-200 mb-1"
                >
                  {blog.title}
                </Link>
                {blog.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                )}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                <span>By <strong className="text-slate-600 font-semibold">{blog.author || "Admin"}</strong></span>
                <Link href={`/blog/${blog.slug}`} className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                  Read &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestBlog;

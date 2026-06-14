import Container from "@/components/Container";
import Title from "@/components/Title";
import { Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
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

export const dynamic = "force-dynamic";

const BlogPage = async () => {
  const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.publishedAt));

  return (
    <div className="bg-slate-50/30 min-h-screen py-10">
      <Container>
        <Title className="text-2xl font-black text-slate-800 tracking-tight">Latest Articles</Title>
        <p className="text-xs text-slate-500 mt-1 mb-8">Stay up to date with the latest tech news, guides, and trends</p>

        {allBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <p className="text-slate-400 font-semibold">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBlogs.map((blog) => (
              <div key={blog.id} className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                  <Image
                    src={blog.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"}
                    alt={blog.title || "blog"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-4">
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
                      className="text-base font-extrabold tracking-tight text-slate-800 hover:text-emerald-600 block line-clamp-2 transition-colors duration-200"
                    >
                      {blog.title}
                    </Link>
                    {blog.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-400">By <strong className="text-slate-600 font-semibold">{blog.author || "Admin"}</strong></span>
                    <Link href={`/blog/${blog.slug}`} className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors duration-200">
                      Read Article &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default BlogPage;

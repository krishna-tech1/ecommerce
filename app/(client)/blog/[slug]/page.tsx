import Container from "@/components/Container";
import Title from "@/components/Title";
import { Calendar, ChevronLeftIcon, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { eq, ne, desc } from "drizzle-orm";
import Image from "next/image";

export const dynamic = "force-dynamic";

const SingleBlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  // Fetch individual blog
  const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug));
  if (!blog) return notFound();

  // Fetch other latest blogs
  const otherBlogs = await db
    .select()
    .from(blogs)
    .where(ne(blogs.slug, slug))
    .orderBy(desc(blogs.publishedAt))
    .limit(4);

  // Fetch all blogs to compile dynamic category counts
  const allBlogsList = await db.select().from(blogs);
  const categoriesList = Array.from(
    new Set(allBlogsList.map((b) => b.category).filter(Boolean))
  ) as string[];

  return (
    <div className="py-12 bg-slate-50/20 min-h-screen">
      <Container className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-sm bg-slate-100 border border-slate-100">
            <Image
              src={blog.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"}
              alt={blog.title || "blog"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover"
            />
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="text-xs flex items-center gap-5 flex-wrap">
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {blog.category || "General"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Pencil size={14} /> {blog.author || "Admin"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Calendar size={14} />{" "}
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {blog.title}
            </h2>
            <div className="text-slate-600 prose max-w-none">
              {blog.body.split("\n").map((para, i) => (
                <p key={i} className="my-4 text-base leading-8 text-slate-600">
                  {para}
                </p>
              ))}
              <div className="mt-8 pt-6 border-t border-slate-50">
                <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm">
                  <ChevronLeftIcon className="size-5" />
                  <span>Back to all articles</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {categoriesList.length > 0 && (
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <Title className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">Blog Categories</Title>
              <div className="space-y-3">
                {categoriesList.map((cat, index) => (
                  <div
                    key={index}
                    className="text-slate-600 flex items-center justify-between text-sm font-semibold hover:text-emerald-600 transition-colors"
                  >
                    <p>{cat}</p>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                      {allBlogsList.filter((b) => b.category === cat).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherBlogs.length > 0 && (
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <Title className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">Latest Articles</Title>
              <div className="space-y-4">
                {otherBlogs.map((b) => (
                  <Link
                    href={`/blog/${b.slug}`}
                    key={b.id}
                    className="flex items-center gap-3 group"
                  >
                    <Image
                      src={b.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"}
                      alt={b.title || "recommended blog"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 group-hover:border-emerald-300 transition duration-300 flex-shrink-0"
                    />
                    <p className="line-clamp-2 text-xs font-semibold text-slate-600 group-hover:text-emerald-700 transition duration-200">
                      {b.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SingleBlogPage;

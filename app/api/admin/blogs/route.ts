import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    return NextResponse.json(allBlogs);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, excerpt, bodyText, category, author, image } = body;

    if (!title || !bodyText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const [newBlog] = await db
      .insert(blogs)
      .values({
        title,
        slug,
        excerpt: excerpt || null,
        body: bodyText,
        category: category || null,
        author: author || "Admin",
        image: image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop",
      })
      .returning();

    return NextResponse.json(newBlog);
  } catch (error) {
    console.error("Failed to create blog:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, excerpt, bodyText, category, author, image } = body;

    if (!id || !title || !bodyText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const [updatedBlog] = await db
      .update(blogs)
      .set({
        title,
        slug,
        excerpt: excerpt || null,
        body: bodyText,
        category: category || null,
        author: author || "Admin",
        image: image || null,
      })
      .where(eq(blogs.id, id))
      .returning();

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Failed to update blog:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing blog ID" }, { status: 400 });
    }

    const [deletedBlog] = await db
      .delete(blogs)
      .where(eq(blogs.id, id))
      .returning();

    return NextResponse.json(deletedBlog);
  } catch (error) {
    console.error("Failed to delete blog:", error);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}

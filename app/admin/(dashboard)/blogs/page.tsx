"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: string | null;
  author: string | null;
  image: string | null;
  publishedAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      } else {
        toast.error("Failed to load blogs");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setEditingBlog(null);
    setTitle("");
    setExcerpt("");
    setBodyText("");
    setCategory("");
    setAuthor("");
    setImage("");
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setExcerpt(blog.excerpt || "");
    setBodyText(blog.body);
    setCategory(blog.category || "");
    setAuthor(blog.author || "");
    setImage(blog.image || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bodyText) {
      toast.error("Title and Body are required");
      return;
    }

    const payload = {
      id: editingBlog?.id,
      title,
      excerpt,
      bodyText,
      category,
      author,
      image,
    };

    try {
      const method = editingBlog ? "PUT" : "POST";
      const res = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingBlog ? "Blog updated successfully!" : "Blog created successfully!");
        setIsModalOpen(false);
        fetchBlogs();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else {
        toast.error("Failed to delete blog");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blogs</h1>
          <p className="text-sm text-slate-500">Create, edit, and manage your store blog articles</p>
        </div>
        <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer">
          <Plus className="h-4 w-4" />
          Add Blog
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-100">
              <TableHead className="font-bold text-slate-800">Title</TableHead>
              <TableHead className="font-bold text-slate-800">Category</TableHead>
              <TableHead className="font-bold text-slate-800">Author</TableHead>
              <TableHead className="font-bold text-slate-800">Published Date</TableHead>
              <TableHead className="w-[120px] text-right font-bold text-slate-800">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                    <span className="text-sm text-slate-500 font-semibold">Loading blogs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 py-12">
                  No blogs found. Click &quot;Add Blog&quot; to write your first post.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-slate-50/50 transition">
                  <TableCell className="font-bold text-slate-800 max-w-sm truncate">
                    {blog.title}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {blog.category || <span className="text-slate-300">Uncategorized</span>}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">
                    {blog.author || "Admin"}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs">
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => openEditModal(blog)} variant="outline" size="icon" className="border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <Edit2 className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button onClick={() => handleDelete(blog.id)} variant="destructive" size="icon" className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Interactive Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingBlog ? "Edit Blog Post" : "Add New Blog Post"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-200/50 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Blog Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. My Awesome Tech Article"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Smartphones, Audio"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Author Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Alex Thompson"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Short Excerpt</label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Summarize the blog post briefly..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Article Content (Body) *</label>
                <textarea
                  required
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Write the full content of your article here..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow-md shadow-emerald-950/10 transition cursor-pointer">
                  {editingBlog ? "Save Changes" : "Create Blog"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

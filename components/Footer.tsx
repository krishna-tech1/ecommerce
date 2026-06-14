"use client";

import React, { useState } from "react";
import Container from "./Container";
import FooterTop from "./FooterTop";
import Logo from "./Logo";
import SocialMedia from "./SocialMedia";
import { categoriesData, quickLinksData } from "@/constants/data";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <Container>
        <FooterTop />
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo className="text-white hover:text-emerald-400" spanDesign="text-emerald-400 group-hover:text-emerald-300" />
            <p className="text-slate-400 text-sm leading-relaxed">
              Discover premium smart gadgets and curated electronics at Maestro Shopcart,
              blending state-of-the-art tech with incredible deals.
            </p>
            <SocialMedia
              className="text-slate-400"
              iconClassName="border-slate-800 bg-slate-800 hover:border-emerald-500 hover:text-emerald-400 hover:scale-105"
              tooltipClassName="bg-emerald-950 text-white"
            />
          </div>
          <div>
            <h4 className="text-slate-200 font-bold tracking-wider text-xs uppercase mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinksData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={item?.href}
                    className="hover:text-emerald-400 transition-colors duration-200 font-medium text-sm text-slate-400"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold tracking-wider text-xs uppercase mb-4">Categories</h4>
            <ul className="space-y-3">
              {categoriesData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={`/category/${item?.href}`}
                    className="hover:text-emerald-400 transition-colors duration-200 font-medium text-sm text-slate-400"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-slate-200 font-bold tracking-wider text-xs uppercase">Newsletter</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Subscribe to our newsletter to receive updates and exclusive
              offers
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                placeholder="Enter your email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500 rounded-lg text-sm"
              />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 font-bold transition-all duration-200 py-2.5 rounded-lg" type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Maestro Shopcart. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

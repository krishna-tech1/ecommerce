import React from "react";
import Link from "next/link";
import Image from "next/image";
import { banner_1 } from "@/images";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

const badges = [
  { icon: <Zap size={14} />, text: "Up to 75% Off" },
  { icon: <Shield size={14} />, text: "Secure Checkout" },
  { icon: <Truck size={14} />, text: "Free Delivery" },
];

const HomeBanner = () => {
  return (
    <div className="relative overflow-hidden py-12 md:py-0 bg-gradient-to-br from-shop_light_pink via-white to-shop_light_green/10 rounded-2xl px-8 lg:px-16 flex items-center justify-between min-h-[320px] md:min-h-[400px]">
      {/* Background circles for depth */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-shop_light_green/5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-shop_orange/5 blur-3xl" />

      {/* Left content */}
      <div className="relative z-10 space-y-5 max-w-lg animate-fade-in-up">
        {/* Label */}
        <div className="inline-flex items-center gap-2 bg-shop_dark_green/10 text-shop_dark_green text-xs font-semibold px-3 py-1.5 rounded-full">
          <Zap size={12} fill="currentColor" />
          Flash Sale — Limited Time
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-darkColor leading-tight">
            Grab Upto{" "}
            <span className="text-shop_dark_green relative">
              75% Off
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-shop_light_green/60 rounded-full" />
            </span>
            <br />
            on Smart Gadgets
          </h1>
          <p className="text-sm text-lightColor max-w-sm">
            Discover the latest tech at unbeatable prices. Shop premium gadgets,
            appliances, and accessories — delivered to your door.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/shop"
            className="flex items-center gap-2 bg-shop_dark_green text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-shop_dark_green/90 hover:gap-3 hoverEffect shadow-lg shadow-shop_dark_green/20"
          >
            Shop Now <ArrowRight size={16} />
          </Link>
          <Link
            href="/deal"
            className="flex items-center gap-2 border border-shop_dark_green/40 text-shop_dark_green px-6 py-3 rounded-full text-sm font-bold hover:bg-shop_dark_green hover:text-white hoverEffect"
          >
            View Deals
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-4 pt-2 flex-wrap">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs text-lightColor font-medium"
            >
              <span className="text-shop_dark_green">{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right image */}
      <div className="relative z-10 hidden md:block animate-scale-in">
        {/* Glow behind image */}
        <div className="absolute inset-0 rounded-full bg-shop_light_green/20 blur-2xl scale-75" />
        <Image
          src={banner_1}
          alt="Smart Gadgets Banner"
          className="relative w-72 lg:w-96 drop-shadow-2xl hover:scale-105 hoverEffect"
          priority
        />
        {/* Floating price badge */}
        <div className="absolute top-4 -left-4 bg-white shadow-lg rounded-xl px-3 py-2 text-xs font-bold text-shop_dark_green border border-shop_light_green/20 animate-bounce">
          🔥 Best Seller
        </div>
        <div className="absolute bottom-8 -right-2 bg-shop_dark_green text-white shadow-lg rounded-xl px-3 py-2 text-xs font-bold">
          Save up to $500
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;

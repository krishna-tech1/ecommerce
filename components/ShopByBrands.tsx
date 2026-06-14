import React from "react";
import Title from "./Title";
import Link from "next/link";
import Image from "next/image";
import { GitCompareArrows, Headset, ShieldCheck, Truck } from "lucide-react";

// Static brand data using local images (images/brands/)
const staticBrands = [
  { id: "1", name: "Brand 1", slug: "brand-1", image: "/images/brands/brand_1.webp" },
  { id: "2", name: "Brand 2", slug: "brand-2", image: "/images/brands/brand_2.jpg" },
  { id: "3", name: "Brand 3", slug: "brand-3", image: "/images/brands/brand_3.png" },
  { id: "4", name: "Brand 4", slug: "brand-4", image: "/images/brands/brand_4.png" },
  { id: "5", name: "Brand 5", slug: "brand-5", image: "/images/brands/brand_5.png" },
  { id: "6", name: "Brand 6", slug: "brand-6", image: "/images/brands/brand_6.png" },
  { id: "7", name: "Brand 7", slug: "brand-7", image: "/images/brands/brand_7.png" },
  { id: "8", name: "Brand 8", slug: "brand-8", image: "/images/brands/brand_8.png" },
];

const extraData = [
  {
    title: "Free Delivery",
    description: "Free shipping over $100",
    icon: <Truck size={45} />,
  },
  {
    title: "Free Return",
    description: "Free returns within 30 days",
    icon: <GitCompareArrows size={45} />,
  },
  {
    title: "Customer Support",
    description: "Friendly 24/7 customer support",
    icon: <Headset size={45} />,
  },
  {
    title: "Money Back Guarantee",
    description: "Quality checked by our team",
    icon: <ShieldCheck size={45} />,
  },
];

const ShopByBrands = () => {
  return (
    <div className="mb-10 lg:mb-20 bg-slate-50 border border-slate-100/80 p-6 lg:p-8 rounded-2xl">
      <div className="flex items-center gap-5 justify-between mb-8">
        <Title className="text-xl font-bold text-slate-800">Shop By Brands</Title>
        <Link
          href={"/shop"}
          className="text-xs md:text-sm font-bold text-shop_dark_green hover:text-shop_light_green transition-colors duration-200 underline underline-offset-4"
        >
          View all brands
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {staticBrands.map((brand) => (
          <Link
            key={brand.id}
            href={{ pathname: "/shop", query: { brand: brand.slug } }}
            className="bg-white border border-slate-100/80 flex items-center justify-center rounded-xl overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-300 group p-2 h-20"
          >
            <Image
              src={brand.image}
              alt={brand.name}
              width={250}
              height={250}
              className="w-full h-full object-contain p-1 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
            />
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {extraData?.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-slate-100/60 p-5 rounded-xl flex items-center gap-4 hover:shadow-sm transition-all duration-300 group"
          >
            <span className="text-emerald-600 transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
              {item?.icon}
            </span>
            <div className="text-sm">
              <p className="text-slate-800 font-bold tracking-tight">
                {item?.title}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{item?.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByBrands;

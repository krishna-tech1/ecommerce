import React from "react";
import Title from "./Title";
import Link from "next/link";
import {
  Laptop,
  Tv,
  Smartphone,
  Watch,
  Camera,
  Speaker,
  Headphones,
  Gamepad2,
  Refrigerator,
  ShoppingBag,
} from "lucide-react";

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
}

// Pick an icon based on category name keywords
// Pick an icon based on category name keywords
function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  const iconClass = "text-emerald-600 group-hover:text-white transition-colors duration-300";
  if (lower.includes("laptop") || lower.includes("computer")) return <Laptop size={28} className={iconClass} />;
  if (lower.includes("tv") || lower.includes("television")) return <Tv size={28} className={iconClass} />;
  if (lower.includes("phone") || lower.includes("mobile")) return <Smartphone size={28} className={iconClass} />;
  if (lower.includes("watch")) return <Watch size={28} className={iconClass} />;
  if (lower.includes("camera")) return <Camera size={28} className={iconClass} />;
  if (lower.includes("speaker") || lower.includes("audio")) return <Speaker size={28} className={iconClass} />;
  if (lower.includes("headphone") || lower.includes("earphone")) return <Headphones size={28} className={iconClass} />;
  if (lower.includes("game") || lower.includes("console")) return <Gamepad2 size={28} className={iconClass} />;
  if (lower.includes("appliance") || lower.includes("fridge") || lower.includes("kitchen")) return <Refrigerator size={28} className={iconClass} />;
  return <ShoppingBag size={28} className={iconClass} />;
}

const HomeCategories = ({ categories }: { categories: DbCategory[] }) => {
  return (
    <div className="bg-white border border-slate-100 my-10 md:my-16 p-6 lg:p-8 rounded-2xl shadow-sm">
      <Title className="border-b border-slate-100 pb-4 text-xl font-bold text-slate-800">Popular Categories</Title>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <Link
            key={category?.id}
            href={`/category/${category?.slug}`}
            className="bg-slate-50 border border-slate-50 p-5 flex items-center gap-4 group rounded-xl hover:bg-white hover:border-slate-100/80 hover:shadow-md transition-all duration-300 ease-out"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-50 group-hover:bg-emerald-600 transition-all duration-300 flex-shrink-0">
              {getCategoryIcon(category.name)}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors duration-200">
                {category?.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-emerald-600 mr-1">
                  {category?.productCount ?? 0}
                </span>
                items available
              </p>
              {category?.description && (
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeCategories;
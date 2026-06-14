"use client";
import { productType } from "@/constants/data";
import Link from "next/link";
interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const HomeTabbar = ({ selectedTab, onTabSelect }: Props) => {
  return (
    <div className="flex items-center flex-wrap gap-5 justify-between border-b border-slate-100 pb-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <div className="flex items-center gap-1.5 md:gap-3">
          {productType?.map((item) => (
            <button
              onClick={() => onTabSelect(item?.title)}
              key={item?.title}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-95 ${
                selectedTab === item?.title
                  ? "bg-shop_dark_green text-white shadow-md shadow-shop_dark_green/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item?.title}
            </button>
          ))}
        </div>
      </div>
      <Link
        href={"/shop"}
        className="text-xs md:text-sm font-bold text-shop_dark_green hover:text-shop_light_green transition-colors duration-200 underline underline-offset-4"
      >
        See all products
      </Link>
    </div>
  );
};

export default HomeTabbar;

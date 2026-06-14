import { DbProduct } from "@/lib/types";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Star, Flame } from "lucide-react";
import PriceView from "./PriceView";
import Title from "./Title";
import ProductSideMenu from "./ProductSideMenu";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product }: { product: DbProduct }) => {
  const imageUrl = product?.images?.[0] || "/placeholder.png";

  return (
    <div className="text-sm border border-slate-100/80 rounded-xl overflow-hidden group bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between">
      <div className="relative overflow-hidden bg-slate-50">
        {imageUrl && (
          <Link href={`/product/${product?.slug?.current}`} className="block">
            <Image
              src={imageUrl}
              alt={product?.name || "product"}
              width={500}
              height={500}
              priority
              className={`w-full h-64 object-contain overflow-hidden transition-transform bg-slate-50 duration-500 
              ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
            />
          </Link>
        )}
        <ProductSideMenu product={product} />
        {product?.status === "sale" ? (
          <p className="absolute top-3 left-3 z-10 text-[10px] uppercase tracking-wider bg-shop_orange text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
            Sale!
          </p>
        ) : (
          <Link
            href={"/deal"}
            className="absolute top-3 left-3 z-10 bg-white/95 border border-slate-100 p-1.5 rounded-full shadow-sm hover:scale-105 transition-transform duration-200"
          >
            <Flame
              size={16}
              fill="#fb6c08"
              className="text-shop_orange"
            />
          </Link>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-grow">
        {product?.categories && product.categories.length > 0 && (
          <p className="uppercase tracking-wider text-[10px] font-semibold text-slate-400">
            {product.categories.join(", ")}
          </p>
        )}
        <Title className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-shop_dark_green transition-colors duration-200">{product?.name}</Title>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={14}
                className={index < 4 ? "text-amber-500 fill-amber-400" : "text-slate-200 fill-slate-200"}
              />
            ))}
          </div>
          <p className="text-slate-400 text-xs tracking-wide">(5 reviews)</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Availability:</span>
          <span
            className={`font-semibold ${product?.stock === 0 ? "text-red-500 bg-red-50 px-2 py-0.5 rounded-md" : "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"}`}
          >
            {(product?.stock as number) > 0 ? `${product?.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-slate-50">
          <PriceView
            price={product?.price}
            discount={product?.discount}
            className="text-base font-bold"
          />
          <AddToCartButton product={product} className="w-28 text-xs py-2 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

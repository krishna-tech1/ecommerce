"use client";

import useStore from "@/store";
import { useState } from "react";
import Container from "./Container";
import { Heart, X } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { DbProduct } from "@/lib/types";
import toast from "react-hot-toast";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

const WishListProducts = () => {
  const [visibleProducts, setVisibleProducts] = useState(7);
  const { favoriteProduct, removeFromFavorite, resetFavorite } = useStore();

  const loadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 5, favoriteProduct.length));
  };

  const handleResetWishlist = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset your wishlist?"
    );
    if (confirmReset) {
      resetFavorite();
      toast.success("Wishlist reset successfully!");
    }
  };

  return (
    <Container className="py-8">
      {favoriteProduct?.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase">
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left hidden md:table-cell">
                    Category
                  </th>
                  <th className="p-4 text-left md:table-cell">Type</th>
                  <th className="p-4 text-left md:table-cell">Status</th>
                  <th className="p-4 text-left md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {favoriteProduct
                  ?.slice(0, visibleProducts)
                  ?.map((product: DbProduct) => (
                    <tr key={product?._id} className="hover:bg-slate-50/30 transition-colors duration-150">
                      <td className="p-4 flex items-center gap-3">
                        <X
                          onClick={() => {
                            removeFromFavorite(product?._id);
                            toast.success("Removed from wishlist");
                          }}
                          size={16}
                          className="text-slate-400 hover:text-red-500 hover:cursor-pointer transition-colors"
                        />
                        {product?.images?.[0] && (
                          <Link
                            href={`/product/${product?.slug?.current}`}
                            className="border border-slate-100 rounded-xl group hidden md:inline-flex p-1 bg-slate-50 overflow-hidden"
                          >
                            <Image
                              src={product.images[0]}
                              alt={product?.name || "product"}
                              width={80}
                              height={80}
                              className="rounded-lg group-hover:scale-105 transition-transform duration-300 h-16 w-16 object-contain"
                            />
                          </Link>
                        )}
                        <span className="font-bold text-slate-800 line-clamp-1">{product?.name}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {product?.categories && product.categories.length > 0 && (
                          <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">
                            {product.categories.join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-slate-500 font-medium capitalize">
                        {product?.variant}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            (product?.stock as number) > 0
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-red-600 bg-red-50"
                          }`}
                        >
                          {(product?.stock as number) > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </td>
                      <td className="p-4">
                        <AddToCartButton product={product} className="w-full text-xs font-bold py-2 rounded-xl" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-6">
            {visibleProducts < favoriteProduct?.length && (
              <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 py-2.5" onClick={loadMore}>
                Load More
              </Button>
            )}
            {visibleProducts > 10 && (
              <Button
                onClick={() => setVisibleProducts(10)}
                variant="outline"
                className="border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 py-2.5"
              >
                Load Less
              </Button>
            )}
            <Button
              onClick={handleResetWishlist}
              className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold py-2.5 text-xs shadow-sm cursor-pointer"
              variant="outline"
            >
              Reset Wishlist
            </Button>
          </div>
        </>
      ) : (
        <div className="flex min-h-[450px] flex-col items-center justify-center space-y-6 px-4 text-center bg-white border border-slate-100 rounded-2xl shadow-sm mt-8 p-8">
          <div className="relative">
            <div className="absolute -top-1 -right-1 h-3 h-3 animate-ping rounded-full bg-emerald-500/35" />
            <div className="p-5 bg-emerald-50 text-emerald-600 rounded-full">
              <Heart
                className="h-10 w-10"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-slate-500 text-sm">
              Keep track of items you love by adding them to your wishlist.
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md shadow-emerald-950/10 transition-all duration-200 mt-4 cursor-pointer inline-flex">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default WishListProducts;

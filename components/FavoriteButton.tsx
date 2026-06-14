"use client";
import { DbProduct } from "@/lib/types";
import useStore from "@/store";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

const FavoriteButton = ({
  showProduct = false,
  product,
}: {
  showProduct?: boolean;
  product?: DbProduct | null | undefined;
}) => {
  const { favoriteProduct, addToFavorite } = useStore();
  const { status } = useSession();
  const router = useRouter();
  const [existingProduct, setExistingProduct] = useState<DbProduct | null>(null);

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item) => item?._id === product?._id
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (status !== "authenticated") {
      toast.error("Please sign in to manage your wishlist.");
      router.push("/sign-in");
      return;
    }

    if (product?._id) {
      addToFavorite(product).then(() => {
        const isRemoving = !!existingProduct;
        toast.success(
          isRemoving
            ? "Product removed successfully!"
            : "Product added successfully!"
        );

        if (!isRemoving) {
          trackMetaEvent("AddToWishlist", {
            content_name: product.name,
            content_ids: [product._id],
            content_type: "product",
            value: product.price,
            currency: "USD",
          });
        }
      });
    }
  };
  return (
    <>
      {!showProduct ? (
        <Link href={"/wishlist"} className="group relative">
          <Heart className="w-5 h-5 hover:text-shop_light_green hoverEffect" />
          <span className="absolute -top-1 -right-1 bg-shop_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
            {favoriteProduct?.length && status === "authenticated" ? favoriteProduct?.length : 0}
          </span>
        </Link>
      ) : (
        <button
          onClick={handleFavorite}
          className="group relative hover:text-shop_light_green hoverEffect border border-shop_light_green/80 hover:border-shop_light_green p-1.5 rounded-sm"
        >
          {existingProduct && status === "authenticated" ? (
            <Heart
              fill="#3b9c3c"
              className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5 w-5 h-5"
            />
          ) : (
            <Heart className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5 w-5 h-5" />
          )}
        </button>
      )}
    </>
  );
};

export default FavoriteButton;

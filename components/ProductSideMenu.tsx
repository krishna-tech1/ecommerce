"use client";
import { cn } from "@/lib/utils";
import { DbProduct } from "@/lib/types";
import useStore from "@/store";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

const ProductSideMenu = ({
  product,
  className,
}: {
  product: DbProduct;
  className?: string;
}) => {
  const { favoriteProduct, addToFavorite } = useStore();
  const { status } = useSession();
  const router = useRouter();
  const [existingProduct, setExistingProduct] = useState<DbProduct | null>(null);

  useEffect(() => {
    const availableProduct = favoriteProduct?.find(
      (item) => item?._id === product?._id
    );
    setExistingProduct(availableProduct || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <div
      className={cn("absolute top-2 right-2 hover:cursor-pointer", className)}
    >
      <div
        onClick={handleFavorite}
        className={`p-2.5 rounded-full hover:bg-shop_dark_green/80 hover:text-white hoverEffect  ${existingProduct && status === "authenticated" ? "bg-shop_dark_green/80 text-white" : "bg-lightColor/10"}`}
      >
        <Heart size={15} />
      </div>
    </div>
  );
};

export default ProductSideMenu;

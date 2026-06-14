"use client";
import { DbProduct } from "@/lib/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import useStore from "@/store";
import toast from "react-hot-toast";
import PriceFormatter from "./PriceFormatter";
import QuantityButtons from "./QuantityButtons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { getStoredUtmParameters } from "@/lib/utm";

interface Props {
  product: DbProduct;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  const handleAddToCart = () => {
    if (status !== "authenticated") {
      toast.error("Please sign in to add products to your cart.");
      router.push("/sign-in");
      return;
    }

    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(
        `${product?.name?.substring(0, 12)}... added successfully!`
      );
      
      // Track Meta Pixel AddToCart event
      trackMetaEvent("AddToCart", {
        content_name: product.name,
        content_ids: [product._id],
        content_type: "product",
        value: product.price,
        currency: "USD",
      });

      // Track in backend abandoned carts and start Twilio outreach timer
      if (session?.user) {
        const utms = getStoredUtmParameters();
        fetch("/api/cart/add-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: (session.user as { id?: string }).id || session.user.email,
            productName: product.name,
            productPrice: product.price,
            utmSource: utms?.utm_source,
            utmCampaign: utms?.utm_campaign,
          }),
        }).catch((err) => console.error("Error logging cart event to backend:", err));
      }
    } else {
      toast.error("Can not add more than available stock");
    }
  };
  return (
    <div className="w-full h-12 flex items-center">
      {itemCount && status === "authenticated" ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-darkColor/80">Quantity</span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product?.price * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-shop_dark_green/80 text-lightBg shadow-none border border-shop_dark_green/80 font-semibold tracking-wide text-white hover:bg-shop_dark_green hover:border-shop_dark_green hoverEffect",
            className
          )}
        >
          <ShoppingBag /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
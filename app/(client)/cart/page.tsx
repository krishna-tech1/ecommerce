"use client";

import {
  createCheckoutSession,
  Metadata,
} from "@/actions/createCheckoutSession";
import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceFormatter from "@/components/PriceFormatter";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Local address type (replaces Sanity Address)
interface Address {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default?: boolean;
}
import useStore from "@/store";
import { useSession } from "next-auth/react";
import { ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { getStoredUtmParameters } from "@/lib/utm";

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItems());
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const isSignedIn = status === "authenticated";
  const user = session?.user;
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = [
        {
          _id: "addr_1",
          name: "Home Address",
          address: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          default: true,
        }
      ];
      setAddresses(data as unknown as Address[]);
      setSelectedAddress(data[0] as unknown as Address);
    } catch (error) {
      console.log("Addresses fetching error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isSignedIn) {
      fetchAddresses();
    }
  }, [isSignedIn]);
  const handleResetCart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your cart?"
    );
    if (confirmed) {
      resetCart();
      toast.success("Cart reset successfully!");
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Track Meta Pixel InitiateCheckout event
      trackMetaEvent("InitiateCheckout", {
        value: getTotalPrice(),
        currency: "USD",
        content_type: "product",
        contents: groupedItems.map(item => ({
          id: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        }))
      });

      const utm = getStoredUtmParameters();
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.name ?? "Unknown",
        customerEmail: user?.email ?? "Unknown",
        clerkUserId: (user as { id?: string })?.id,
        address: selectedAddress,
        utmSource: utm?.utm_source || null,
        utmCampaign: utm?.utm_campaign || null,
        utmMedium: utm?.utm_medium || null,
      };
      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-slate-50/50 pb-52 md:pb-20 min-h-screen">
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              <div className="flex items-center gap-2.5 py-8">
                <ShoppingBag className="text-emerald-700" size={24} />
                <Title className="text-2xl font-bold text-slate-800">Shopping Cart</Title>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                    {groupedItems?.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);
                      return (
                        <div
                          key={product?._id}
                          className="border-b border-slate-100 p-5 last:border-b-0 flex items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors"
                        >
                          <div className="flex flex-1 items-start gap-4 h-32 md:h-36">
                            {product?.images && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className="border border-slate-100 p-2 bg-slate-50 rounded-xl overflow-hidden group flex-shrink-0"
                              >
                                <Image
                                  src={product?.images?.[0] ?? ""}
                                  alt="productImage"
                                  width={500}
                                  height={500}
                                  loading="lazy"
                                  className="w-24 md:w-28 h-24 md:h-28 object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                              </Link>
                            )}
                            <div className="h-full flex flex-1 flex-col justify-between py-1">
                              <div className="space-y-1">
                                <h2 className="text-base font-bold text-slate-800 line-clamp-1">
                                  {product?.name}
                                </h2>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span className="capitalize">
                                    Variant: <strong className="text-slate-700">{product?.variant}</strong>
                                  </span>
                                  <span className="h-3 w-px bg-slate-200" />
                                  <span className="capitalize">
                                    Status: <strong className="text-slate-700">{product?.status}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="cursor-pointer">
                                        <ProductSideMenu
                                          product={product}
                                          className="relative top-0 right-0 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold">
                                      Add to Wishlist
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Trash
                                        onClick={() => {
                                          deleteCartProduct(product?._id);
                                          toast.success(
                                            "Product removed from cart"
                                          );
                                        }}
                                        className="w-4 h-4 md:w-5 md:h-5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold bg-red-600 text-white">
                                      Remove product
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between h-32 md:h-36 p-1">
                            <PriceFormatter
                              amount={(product?.price as number) * itemCount}
                              className="font-bold text-base md:text-lg text-slate-800"
                            />
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-5 bg-slate-50/50 border-t border-slate-100">
                      <Button
                        onClick={handleResetCart}
                        className="font-bold text-xs bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 py-2 px-4 rounded-xl shadow-sm cursor-pointer"
                        variant="outline"
                      >
                        Reset Cart
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lg:col-span-1 space-y-6">
                    <div className="hidden md:block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-800 mb-4">
                        Order Summary
                      </h2>
                      <div className="space-y-4 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-slate-800">
                            <PriceFormatter amount={getSubTotalPrice()} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Discount</span>
                          <span className="font-semibold text-emerald-600">
                            -<PriceFormatter
                              amount={getSubTotalPrice() - getTotalPrice()}
                            />
                          </span>
                        </div>
                        <Separator className="bg-slate-100" />
                        <div className="flex items-center justify-between font-bold text-slate-800 text-base">
                          <span>Total</span>
                          <PriceFormatter
                            amount={getTotalPrice()}
                            className="text-lg font-extrabold text-slate-900"
                          />
                        </div>
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-950/10 cursor-pointer active:scale-98 transition-all duration-200 mt-2"
                          size="lg"
                          disabled={loading}
                          onClick={handleCheckout}
                        >
                          {loading ? "Preparing Checkout..." : "Proceed to Checkout"}
                        </Button>
                      </div>
                    </div>
                    {addresses && (
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <Card className="border-0 shadow-none">
                          <CardHeader className="p-6 pb-4">
                            <CardTitle className="text-base font-bold text-slate-800">Delivery Address</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 pt-0">
                            <RadioGroup
                              defaultValue={addresses
                                ?.find((addr) => addr.default)
                                ?._id.toString()}
                            >
                              {addresses?.map((address) => (
                                <div
                                  key={address?._id}
                                  onClick={() => setSelectedAddress(address)}
                                  className={`flex items-start space-x-3 p-3 rounded-xl border border-slate-100 cursor-pointer transition-all ${
                                    selectedAddress?._id === address?._id
                                      ? "border-emerald-500 bg-emerald-50/20 text-emerald-800"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={address?._id.toString()}
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor={`address-${address?._id}`}
                                    className="grid gap-1 flex-1 cursor-pointer"
                                  >
                                    <span className="font-bold text-sm text-slate-800">
                                      {address?.name}
                                    </span>
                                    <span className="text-xs text-slate-500 leading-relaxed">
                                      {address.address}, {address.city},{" "}
                                      {address.state} {address.zip}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <Button variant="outline" className="w-full mt-4 border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50">
                              Add New Address
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
                {/* Order summary for mobile view */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 shadow-lg z-40">
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <PriceFormatter
                        amount={getTotalPrice()}
                        className="text-lg font-extrabold text-slate-900"
                      />
                    </div>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-950/10 cursor-pointer transition-all duration-200"
                      size="lg"
                      disabled={loading}
                      onClick={handleCheckout}
                    >
                      {loading ? "Preparing Checkout..." : "Proceed to Checkout"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
"use client";
import { DbCategory } from "@/lib/types";
import React, { useEffect, useState } from "react";
import Container from "./Container";
import Title from "./Title";
import CategoryList from "./shop/CategoryList";
import { useSearchParams } from "next/navigation";
import BrandList from "./shop/BrandList";
import PriceList from "./shop/PriceList";
import NoProductAvailable from "./NoProductAvailable";
import ProductCard from "./ProductCard";
import { DbProduct } from "@/lib/types";

interface Props {
  categories: DbCategory[];
}
const Shop = ({ categories }: Props) => {
  const searchParams = useSearchParams();
  const brandParams = searchParams?.get("brand");
  const categoryParams = searchParams?.get("category");
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParams || null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandParams || null
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let minPrice = 0;
      let maxPrice = 10000;
      if (selectedPrice) {
        const [min, max] = selectedPrice.split("-").map(Number);
        minPrice = min;
        maxPrice = max;
      }
      const url = new URL("/api/products", window.location.origin);
      if (selectedCategory) {
        url.searchParams.set("category", selectedCategory);
      }
      url.searchParams.set("minPrice", minPrice.toString());
      url.searchParams.set("maxPrice", maxPrice.toString());

      const res = await fetch(url.toString());
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.log("Shop product fetching Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedBrand, selectedPrice]);
  return (
    <div className="border-t border-slate-100 bg-slate-50/30 min-h-screen">
      <Container className="mt-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Title className="text-xl font-bold text-slate-800 tracking-tight">
                Explore Products
              </Title>
              <p className="text-xs text-slate-500 mt-1">Filter products to find exactly what you need</p>
            </div>
            {(selectedCategory !== null ||
              selectedBrand !== null ||
              selectedPrice !== null) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setSelectedPrice(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-full font-bold transition-all duration-200 shadow-sm self-start sm:self-center"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 border-t border-slate-100 pt-6">
          <div className="md:sticky md:top-24 md:self-start md:h-[calc(100vh-160px)] md:overflow-y-auto md:min-w-64 pb-8 md:border-r border-slate-100 pr-6 scrollbar-hide">
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-6">
              <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <div className="border-t border-slate-50 pt-4">
                <BrandList
                  setSelectedBrand={setSelectedBrand}
                  selectedBrand={selectedBrand}
                />
              </div>
              <div className="border-t border-slate-50 pt-4">
                <PriceList
                  setSelectedPrice={setSelectedPrice}
                  selectedPrice={selectedPrice}
                />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-[calc(100vh-160px)] overflow-y-auto pr-2 scrollbar-hide">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl overflow-hidden bg-white p-4 space-y-4 animate-pulse">
                      <div className="h-48 bg-slate-100 rounded-lg w-full" />
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-5 bg-slate-100 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-5 bg-slate-100 rounded w-1/3" />
                        <div className="h-8 bg-slate-100 rounded-full w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products?.map((product) => (
                    <ProductCard key={product?._id} product={product} />
                  ))}
                </div>
              ) : (
                <NoProductAvailable className="bg-white mt-0 rounded-2xl border border-slate-100 shadow-sm p-10" />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;

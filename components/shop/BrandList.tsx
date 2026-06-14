import React from "react";
import Title from "../Title";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

// Static brand list matching the local brand images
const brands = [
  { id: "1", name: "Brand 1", slug: "brand-1" },
  { id: "2", name: "Brand 2", slug: "brand-2" },
  { id: "3", name: "Brand 3", slug: "brand-3" },
  { id: "4", name: "Brand 4", slug: "brand-4" },
  { id: "5", name: "Brand 5", slug: "brand-5" },
  { id: "6", name: "Brand 6", slug: "brand-6" },
  { id: "7", name: "Brand 7", slug: "brand-7" },
  { id: "8", name: "Brand 8", slug: "brand-8" },
];

interface Props {
  selectedBrand?: string | null;
  setSelectedBrand: React.Dispatch<React.SetStateAction<string | null>>;
  // Keep brands prop optional for backward compat but not used
  brands?: unknown;
}

const BrandList = ({ selectedBrand, setSelectedBrand }: Props) => {
  return (
    <div className="w-full bg-white p-5">
      <Title className="text-base font-black">Brands</Title>
      <RadioGroup value={selectedBrand || ""} className="mt-2 space-y-1">
        {brands?.map((brand) => (
          <div
            key={brand.id}
            onClick={() => setSelectedBrand(brand.slug)}
            className="flex items-center space-x-2 hover:cursor-pointer"
          >
            <RadioGroupItem
              value={brand.slug}
              id={brand.slug}
              className="rounded-sm"
            />
            <Label
              htmlFor={brand.slug}
              className={`${selectedBrand === brand.slug ? "font-semibold text-shop_dark_green" : "font-normal"}`}
            >
              {brand.name}
            </Label>
          </div>
        ))}
        {selectedBrand && (
          <button
            onClick={() => setSelectedBrand(null)}
            className="text-sm font-medium mt-2 underline underline-offset-2 decoration-[1px] hover:text-shop_dark_green hoverEffect text-left"
          >
            Reset selection
          </button>
        )}
      </RadioGroup>
    </div>
  );
};

export default BrandList;

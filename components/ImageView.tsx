"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useState } from "react";

interface Props {
  images?: string[]; // Plain URL strings from DB
  isStock?: number | undefined;
}

const ImageView = ({ images = [], isStock }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || "";

  return (
    <div className="w-full md:w-1/2 space-y-2 md:space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-h-[550px] min-h-[450px] border border-darkColor/10 rounded-md group overflow-hidden"
        >
          {activeImage && (
            <Image
              src={activeImage}
              alt="productImage"
              width={700}
              height={700}
              priority
              className={`w-full h-96 max-h-[550px] min-h-[500px] object-contain group-hover:scale-110 hoverEffect rounded-md ${
                isStock === 0 ? "opacity-50" : ""
              }`}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2 flex-wrap">
        {images?.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`border rounded-md overflow-hidden ${activeIndex === index ? "border-darkColor opacity-100" : "opacity-80"}`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              width={100}
              height={100}
              className="w-20 h-20 object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageView;

"use client";

import React, { useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin";

interface StatusDropdownProps {
  orderId: string;
  currentStatus: string;
}

export default function StatusDropdown({ orderId, currentStatus }: StatusDropdownProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
      <option value="shipped">Shipped</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

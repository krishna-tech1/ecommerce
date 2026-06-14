"use client";

import { DbOrder } from "@/lib/order-types";
import { TableBody, TableCell, TableRow } from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import PriceFormatter from "./PriceFormatter";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useState } from "react";
import OrderDetailDialog from "./OrderDetailDialog";

const OrdersComponent = ({ orders }: { orders: DbOrder[] }) => {
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders.map((order) => (
            <Tooltip key={order?.orderNumber}>
              <TooltipTrigger asChild>
                <TableRow
                  className="cursor-pointer hover:bg-slate-50 h-12 transition-colors duration-200"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-semibold text-slate-800">
                    {order.orderNumber?.slice(-10) ?? "N/A"}...
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500">
                    {order?.createdAt &&
                      format(new Date(order.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium">{order.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-500">
                    {order.customerEmail}
                  </TableCell>
                  <TableCell>
                    <PriceFormatter
                      amount={Number(order?.totalPrice)}
                      className="text-slate-800 font-bold"
                    />
                  </TableCell>
                  <TableCell>
                    {order?.status && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-bold border ${
                          order.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {order?.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center justify-center group">
                    <Eye
                      size={18}
                      className="text-slate-400 group-hover:text-emerald-600 transition-colors duration-200"
                    />
                  </TableCell>
                </TableRow>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to see order details</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </TableBody>
      <OrderDetailDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default OrdersComponent;

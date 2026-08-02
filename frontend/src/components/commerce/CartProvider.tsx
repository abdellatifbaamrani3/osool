"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";

export function CartProvider() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  return (
    <>
      <CartDrawer />
      <CheckoutModal />
    </>
  );
}

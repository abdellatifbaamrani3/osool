"use client";

import { MessageCircle } from "lucide-react";
import { ar } from "@/content/ar";
import { useCart } from "@/store/cart";

export function WhatsAppFab() {
  const hidden = useCart((s) => s.isCartOpen || s.isCheckoutOpen);
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966500000000";
  const href = `https://wa.me/${wa}?text=${encodeURIComponent(ar.whatsapp.prefill)}`;

  if (hidden) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 start-5 z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-lg)] transition-transform hover:scale-105 active:scale-95"
      aria-label={ar.whatsapp.label}
      data-cta="whatsapp-fab"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}

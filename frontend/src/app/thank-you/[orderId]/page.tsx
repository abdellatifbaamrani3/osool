import type { Metadata } from "next";
import { ThankYouClient } from "@/components/commerce/ThankYouClient";

export const metadata: Metadata = {
  title: "تم الطلب",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <ThankYouClient orderId={orderId} />;
}

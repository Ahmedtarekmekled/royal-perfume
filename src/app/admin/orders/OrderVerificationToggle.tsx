'use client';

import { Switch } from "@/components/ui/switch";
import { toggleOrderVerification } from "../actions";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface OrderverificationToggleProps {
  orderId: string;
  isVerified: boolean;
}

export default function OrderVerificationToggle({ orderId, isVerified }: OrderverificationToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
        await toggleOrderVerification(orderId, isVerified);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      <Switch 
        checked={isVerified}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span className={isVerified ? "text-green-600 font-medium" : "text-gray-500"}>
        {isVerified ? "Verified" : "Pending"}
      </span>
    </div>
  );
}

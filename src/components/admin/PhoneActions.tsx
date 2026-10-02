'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Phone, MessageCircle } from 'lucide-react';

export default function PhoneActions({ phone, className }: { phone: string; className?: string }) {
  const digitsOnly = phone.replace(/[^0-9]/g, '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={className ?? 'text-left hover:underline hover:text-slate-900'}
        >
          {phone}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem asChild>
          <a href={`tel:${phone}`}>
            <Phone className="h-4 w-4 mr-2" /> Call
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`https://wa.me/${digitsOnly}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

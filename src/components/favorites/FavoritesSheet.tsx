'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import FavoritesClient from '@/components/favorites/FavoritesClient';

interface FavoritesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FavoritesSheet({ open, onOpenChange }: FavoritesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined} className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Your Favorites</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <FavoritesClient onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

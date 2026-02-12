'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Truck, Star, LogOut, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

interface SidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: LayoutDashboard }, // Using LayoutDashboard as placeholder if needed, or maybe specific icon
    { href: '/admin/brands', label: 'Brands', icon: Star },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/shipping', label: 'Shipping', icon: Truck },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-white border-r border-zinc-800">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-6">
             <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">R</span>
             </div>
             <div>
                <h1 className="text-lg font-playfair font-bold">Royal Perfume</h1>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Admin Panel</p>
             </div>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Overview</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-black" : "text-zinc-500 group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-900">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 pl-4"
            onClick={onSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
             </div>
             <span className="font-playfair font-bold">Admin</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-zinc-800 bg-zinc-950 w-80">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                <SidebarContent />
            </SheetContent>
          </Sheet>
      </div>
    </>
  );
}

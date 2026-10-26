'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Star,
  LogOut,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Tags,
  BookOpen,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface SidebarProps {
  onSignOut: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Tags },
      { href: '/admin/brands', label: 'Brands', icon: Star },
      { href: '/admin/shipping', label: 'Shipping', icon: Truck },
    ],
  },
  {
    label: 'Exports',
    items: [
      { href: '/admin/price-list', label: 'Price List', icon: FileSpreadsheet },
      { href: '/admin/catalog', label: 'Catalog', icon: BookOpen },
    ],
  },
  {
    label: 'Marketing',
    items: [{ href: '/admin/marketing/seasonal-collections', label: 'Seasonal Collections', icon: Sparkles }],
  },
  {
    label: 'System',
    items: [{ href: '/admin/settings', label: 'Settings', icon: Settings }],
  },
];

const isActive = (pathname: string | null, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname === href || !!pathname?.startsWith(`${href}/`);

function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white', className)}>
      <Image src="/images/royalLogo.png" alt="Royal Perfumes" width={40} height={40} className="h-[82%] w-[82%] object-contain" />
    </span>
  );
}

export default function AdminSidebar({ onSignOut, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const currentLabel =
    navGroups.flatMap((g) => g.items).find((i) => isActive(pathname, i.href))?.label ?? 'Admin';

  // `collapsed` only applies to the desktop rail, never the mobile sheet.
  const renderContent = (collapsed: boolean) => (
    <div className="relative flex h-full flex-col bg-zinc-950 text-white">
      {/* Brand */}
      <div className={cn('flex items-center gap-3 border-b border-white/[0.06] px-5 py-5', collapsed && 'md:justify-center md:px-0')}>
        <Link href="/admin" onClick={() => setIsOpen(false)} className="flex min-w-0 items-center gap-3">
          <Logo className="h-10 w-10" />
          <div className={cn('min-w-0', collapsed && 'md:hidden')}>
            <p className="truncate font-playfair text-[17px] font-bold leading-tight">Royal Perfumes</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-zinc-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p
              className={cn(
                'mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500',
                collapsed && 'md:hidden'
              )}
            >
              {group.label}
            </p>
            {collapsed && <div className="mx-auto mb-2 hidden h-px w-6 bg-white/10 md:block" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-all duration-200',
                      active
                        ? 'bg-white font-medium text-black shadow-[0_1px_8px_rgba(255,255,255,0.08)]'
                        : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white',
                      collapsed && 'md:justify-center md:px-0'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        active ? 'text-black' : 'text-zinc-500 group-hover:text-white'
                      )}
                      strokeWidth={active ? 2 : 1.75}
                    />
                    <span className={cn('truncate', collapsed && 'md:hidden')}>{item.label}</span>
                    {active && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-800" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className={cn('border-t border-white/[0.06] p-3', collapsed && 'md:px-2')}>
        <div className={cn('flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5', collapsed && 'md:flex-col md:bg-transparent md:p-0')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-playfair text-sm font-bold uppercase">
            {(email || 'A').charAt(0)}
          </span>
          <div className={cn('min-w-0 flex-1', collapsed && 'md:hidden')}>
            <p className="truncate text-xs font-medium text-white">{email ?? 'Administrator'}</p>
            <Link href="/" target="_blank" className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-zinc-500 transition hover:text-white">
              View store <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-950/40 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 hidden flex-col border-r border-white/[0.06] transition-[width] duration-300 md:flex',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {renderContent(isCollapsed)}
        {setIsCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow transition hover:bg-zinc-800 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </aside>

      {/* Mobile top bar — fixed while scrolling */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200/80 bg-white/85 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-800 transition hover:bg-gray-100 active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2.5">
          <Logo className="h-8 w-8 ring-1 ring-gray-200" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-playfair text-[15px] font-bold">Royal Perfumes</p>
            <p className="truncate text-[10px] uppercase tracking-[0.18em] text-gray-500">{currentLabel}</p>
          </div>
        </Link>
        <Link
          href="/"
          target="_blank"
          aria-label="View store"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-black"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
        </Link>
      </header>
      {/* Spacer so page content starts below the fixed bar */}
      <div aria-hidden className="h-14 md:hidden" />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[290px] border-r-0 bg-zinc-950 p-0 [&>button]:text-zinc-400">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          {renderContent(false)}
        </SheetContent>
      </Sheet>
    </>
  );
}

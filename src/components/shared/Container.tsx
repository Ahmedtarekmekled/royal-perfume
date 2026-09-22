import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/**
 * Single source of truth for the site's horizontal grid: one max-width and
 * one responsive padding scale, used on every page instead of ad-hoc
 * max-w-* / px-* combinations. Pass `className` (e.g. "max-w-3xl") to narrow
 * the width for a specific section — twMerge lets it override the default
 * max-w-[1400px] cleanly.
 */
export default function Container<T extends ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

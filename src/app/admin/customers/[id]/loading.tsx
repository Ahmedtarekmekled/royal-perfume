import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-36" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <div className="rounded-md border bg-white">
          <div className="border-b px-4 py-3">
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="px-4 py-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

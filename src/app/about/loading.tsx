import { Skeleton } from "@/components/ui/skeleton";
import Container from '@/components/shared/Container';

export default function Loading() {
  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="pt-20 pb-14 md:pt-28 md:pb-20 overflow-hidden">
        <Container className="flex flex-col items-center space-y-5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-14 md:h-16 w-64 md:w-96" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </Container>
      </div>

      {/* Stats row */}
      <div className="border-y border-gray-100 py-8 md:py-10">
        <Container className="max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          ))}
        </Container>
      </div>

      {/* Our Story */}
      <div className="py-14 md:py-20">
        <Container className="max-w-3xl flex flex-col items-center space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-full max-w-lg" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
        </Container>
      </div>

      {/* Commitment (dark) */}
      <div className="w-full bg-zinc-800 py-12">
        <Container className="max-w-5xl space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-2/3 bg-zinc-700" />
          ))}
        </Container>
      </div>

      {/* Core Strengths */}
      <div className="py-14 md:py-20">
        <Container className="max-w-5xl">
          <div className="mb-10 flex flex-col items-center gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Container>
      </div>

    </div>
  );
}

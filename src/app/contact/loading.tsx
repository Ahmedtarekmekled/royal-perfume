import { Skeleton } from "@/components/ui/skeleton";
import Container from '@/components/shared/Container';

export default function Loading() {
  return (
    <Container className="max-w-2xl py-12 md:py-24 flex flex-col items-center space-y-8">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-5 w-full max-w-md" />
      <div className="w-full p-6 bg-gray-50 rounded-lg space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Container>
  );
}

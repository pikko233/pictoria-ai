import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="container mx-auto space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-6">
        <Skeleton className="col-span-3 h-96" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-52" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </section>
  );
}

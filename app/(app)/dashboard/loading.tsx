export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded-full bg-foreground/10" />
        <div className="h-10 w-72 animate-pulse rounded-full bg-foreground/10" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-foreground/10" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-[28px] border border-border bg-white/70"
          />
        ))}
      </div>
    </div>
  );
}

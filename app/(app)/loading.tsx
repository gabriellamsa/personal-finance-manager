function LoadingBlock({
  className,
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-lg bg-foreground/8 ${className ?? ""}`} />;
}

export default function AppLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <LoadingBlock className="h-4 w-24" />
        <LoadingBlock className="h-12 w-full max-w-xl" />
        <LoadingBlock className="h-5 w-full max-w-2xl" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <LoadingBlock className="h-36" />
        <LoadingBlock className="h-36" />
        <LoadingBlock className="h-36" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <LoadingBlock className="h-[320px]" />
        <LoadingBlock className="h-[320px]" />
      </div>
    </div>
  );
}

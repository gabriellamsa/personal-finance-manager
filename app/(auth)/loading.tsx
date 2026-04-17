function LoadingCardLine({
  className,
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-white/70 ${className ?? ""}`} />;
}

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-[0_20px_60px_rgba(20,33,61,0.08)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <LoadingCardLine className="h-7 w-40" />
          <LoadingCardLine className="h-4 w-full" />
        </div>

        <div className="space-y-4">
          <LoadingCardLine className="h-4 w-24" />
          <LoadingCardLine className="h-12 w-full" />
          <LoadingCardLine className="h-4 w-24" />
          <LoadingCardLine className="h-12 w-full" />
          <LoadingCardLine className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

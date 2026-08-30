function LoadingCardLine({
  className,
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-lg bg-foreground/8 ${className ?? ""}`} />;
}

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md">
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
          <LoadingCardLine className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

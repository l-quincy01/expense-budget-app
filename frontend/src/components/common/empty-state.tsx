type EmptyStateProps = {
  message: string;
  className?: string;
};

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}

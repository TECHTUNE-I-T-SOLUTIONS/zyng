export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-accent animate-bounce" />
        <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

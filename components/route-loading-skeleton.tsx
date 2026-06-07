type RouteLoadingSkeletonProps = {
  variant?: 'public' | 'app' | 'admin' | 'auth';
};

const blocks = {
  public: ['h-8 w-40', 'h-16 w-full max-w-2xl', 'h-5 w-full max-w-xl', 'h-5 w-4/5 max-w-lg'],
  app: ['h-6 w-36', 'h-24 w-full', 'h-24 w-full', 'h-24 w-full'],
  admin: ['h-7 w-48', 'h-28 w-full', 'h-28 w-full', 'h-28 w-full'],
  auth: ['h-8 w-32', 'h-11 w-full', 'h-11 w-full', 'h-11 w-2/3'],
};

export function RouteLoadingSkeleton({ variant = 'app' }: RouteLoadingSkeletonProps) {
  const isPublic = variant === 'public';
  const isAuth = variant === 'auth';

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className={isAuth ? 'mx-auto max-w-md pt-20' : isPublic ? 'mx-auto max-w-6xl pt-24' : 'mx-auto max-w-5xl'}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
          <div className="hidden h-9 w-56 animate-pulse rounded-full bg-muted md:block" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        </div>

        <div className={isPublic ? 'space-y-8 text-center' : 'space-y-5'}>
          {blocks[variant].map((className, index) => (
            <div key={index} className={`${className} ${isPublic ? 'mx-auto' : ''} animate-pulse rounded-lg bg-muted`} />
          ))}
        </div>

        <div className={isPublic ? 'mt-14 grid gap-4 md:grid-cols-3' : 'mt-8 space-y-4'}>
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-border bg-muted/20 p-5">
              <div className="mb-5 h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-9 w-32 bg-muted rounded" />
            </div>
            
            {/* Stats cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-8 w-20 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                ))}
            </div>
            
            {/* Charts and widgets skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-lg border bg-card p-6">
                    <div className="h-6 w-24 bg-muted rounded mb-4" />
                    <div className="h-64 bg-muted rounded" />
                </div>
                <div className="col-span-3 rounded-lg border bg-card p-6 space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-muted rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-3 w-16 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

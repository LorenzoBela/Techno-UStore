export default function Loading() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-9 w-48 bg-muted rounded" />
                <div className="h-10 w-32 bg-muted rounded" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters skeleton */}
                <div className="w-full md:w-64 shrink-0 space-y-4">
                    <div className="h-6 w-24 bg-muted rounded" />
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-8 bg-muted rounded" />
                        ))}
                    </div>
                </div>
                
                {/* Table skeleton */}
                <div className="flex-1 space-y-4">
                    <div className="h-10 bg-muted rounded" />
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}

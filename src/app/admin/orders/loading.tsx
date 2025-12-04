export default function Loading() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-9 w-32 bg-muted rounded" />
            </div>
            
            {/* Tabs skeleton */}
            <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-muted rounded" />
                ))}
            </div>
            
            {/* Table skeleton */}
            <div className="rounded-lg border">
                <div className="h-12 bg-muted/50 rounded-t-lg" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-16 border-t bg-card" />
                ))}
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className="container py-8 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="aspect-square bg-muted rounded-lg" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-1/2 bg-muted rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

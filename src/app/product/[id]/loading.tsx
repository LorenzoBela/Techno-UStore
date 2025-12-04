export default function Loading() {
    return (
        <div className="container py-8 animate-pulse">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Product Image Skeleton */}
                <div className="aspect-square bg-muted rounded-lg" />
                
                {/* Product Details Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-8 w-3/4 bg-muted rounded" />
                    </div>
                    <div className="h-8 w-32 bg-muted rounded" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-2/3 bg-muted rounded" />
                    </div>
                    <div className="space-y-4 pt-4">
                        <div className="h-4 w-16 bg-muted rounded" />
                        <div className="flex gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-10 w-16 bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <div className="h-12 flex-1 bg-muted rounded" />
                        <div className="h-12 w-12 bg-muted rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

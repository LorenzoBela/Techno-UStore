export default function Loading() {
    return (
        <div className="container py-8 animate-pulse">
            <div className="mb-8 rounded-lg bg-muted p-8 h-28" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
                <aside className="hidden md:block">
                    <div className="space-y-4">
                        <div className="h-6 w-24 bg-muted rounded" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-8 bg-muted rounded" />
                        ))}
                    </div>
                </aside>
                <main>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="flex gap-2">
                            <div className="h-10 w-10 bg-muted rounded" />
                            <div className="h-10 w-10 bg-muted rounded" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-square bg-muted rounded-lg" />
                                <div className="h-4 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-1/2 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

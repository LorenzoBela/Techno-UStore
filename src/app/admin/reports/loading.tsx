
export default function Loading() {
    return (
        <div className="flex-1 flex items-center justify-center p-8 h-screen">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground text-sm">Loading reports...</p>
            </div>
        </div>
    );
}

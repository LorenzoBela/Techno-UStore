import { getAdminOrders } from "./order-actions";
import { OrdersContent } from "@/components/admin/OrdersContent";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1", 10);
    const status = params.status || "all";
    const search = params.search || "";
    
    const { orders, total, totalPages } = await getAdminOrders(page, 25, {
        status: status !== "all" ? status : undefined,
        search: search || undefined,
    });

    return (
        <OrdersContent
            orders={orders}
            total={total}
            totalPages={totalPages}
            page={page}
            status={status}
            search={search}
        />
    );
}

import { getPickupOrders } from "./pickup-actions";
import { PickupCalendarContent } from "@/components/admin/PickupCalendarContent";

export const dynamic = 'force-dynamic';

export default async function PickupCalendarPage() {
    // Fetch all future pickup orders, or maybe just all of them to be safe for navigating history
    const orders = await getPickupOrders();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PickupCalendarContent initialOrders={orders} />
        </div>
    );
}

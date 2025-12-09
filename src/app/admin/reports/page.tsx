import { ReportsContent } from "@/components/admin/ReportsContent";
import { getMonthlyRevenue } from "../dashboard-actions";
import {
    getSalesByCategory,
    getOrderStatusDistribution,
    getInventoryHealth,
    getUserGrowth
} from "./reports-actions";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const [
        monthlyRevenue,
        salesByCategory,
        orderStatusDist,
        inventoryHealth,
        userGrowth
    ] = await Promise.all([
        getMonthlyRevenue(),
        getSalesByCategory(),
        getOrderStatusDistribution(),
        getInventoryHealth(),
        getUserGrowth()
    ]);

    return (
        <ReportsContent
            monthlyRevenue={monthlyRevenue}
            salesByCategory={salesByCategory}
            orderStatusDist={orderStatusDist}
            inventoryHealth={inventoryHealth}
            userGrowth={userGrowth}
        />
    );
}

"use client";

import { useParams } from "next/navigation";
import { OrderDetailsContent } from "@/components/admin/OrderDetailsContent";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    return <OrderDetailsContent id={id} />;
}

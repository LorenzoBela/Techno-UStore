"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadPaymentProof(formData: FormData) {
    const file = formData.get("file");
    const orderId = formData.get("orderId") as string;

    if (!file || !(file instanceof File) || !orderId) {
        return { success: false, error: "Missing file or order ID" };
    }

    try {
        const supabase = getSupabaseAdmin();
        const bucketName = 'payment-proofs';

        // Check if bucket exists, create if not (best effort)
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && !buckets.find(b => b.name === bucketName)) {
            await supabase.storage.createBucket(bucketName, {
                public: true
            });
        }

        const buffer = await file.arrayBuffer();
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${orderId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            return { success: false, error: "Failed to upload proof. " + uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        // Update Payment
        await prisma.payment.update({
            where: { orderId },
            data: {
                proofImageUrl: publicUrl,
                status: "pending"
            }
        });

        // Update Order Status to 'pending' (Reviewing)
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "pending" }
        });

        revalidatePath(`/orders/${orderId}`);
        revalidatePath("/admin/orders");

        return { success: true };

    } catch (error) {
        console.error("Payment Proof Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

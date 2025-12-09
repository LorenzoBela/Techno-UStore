"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { uploadPaymentProof } from "@/app/checkout/payment-actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GCashPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    amount: number;
}

export function GCashPaymentModal({
    open,
    onOpenChange,
    orderId,
    amount,
}: GCashPaymentModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("orderId", orderId);

        const result = await uploadPaymentProof(formData);

        if (result.success) {
            toast.success("Payment proof uploaded successfully!");
            onOpenChange(false);
            // Redirect to Order Details or History
            // The requirement: "if accepted they'll be notified on their dash... if rejected".
            // So redirect to Dashboard or Orders list is appropriate.
            router.push(`/orders`);
        } else {
            toast.error(result.error || "Upload failed");
        }
        setIsUploading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>GCash Payment</DialogTitle>
                    <DialogDescription>
                        Scan the QR code to pay ₱{amount.toFixed(2)} and upload the screenshot.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="relative aspect-square w-48 bg-white rounded-lg flex items-center justify-center overflow-hidden border shadow-sm">
                        {/* Placeholder QR - In a real app, this would be dynamic or a static asset */}
                        <Image
                            src="https://placehold.co/200x200/png?text=GCash+QR"
                            alt="GCash QR Code"
                            width={200}
                            height={200}
                            unoptimized
                        />
                    </div>

                    <div className="w-full space-y-3">
                        <div className="text-center text-sm font-medium">
                            Amount to Pay: <span className="text-primary text-lg">₱{amount.toFixed(2)}</span>
                        </div>
                        <label className="text-sm font-medium block">Upload Proof of Payment</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        {file && <p className="text-xs text-muted-foreground truncate">Selected: {file.name}</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {/* Prevent closing if uploading? Or allow cancel? Allow cancel.*/}
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!file || isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Payment
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

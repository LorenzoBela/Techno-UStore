"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CalendarDateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Button
                id="date"
                variant={"outline"}
                className={cn(
                    "w-[260px] justify-start text-left font-normal",
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Jan 20, 2025 - Feb 09, 2025</span>
            </Button>
        </div>
    );
}

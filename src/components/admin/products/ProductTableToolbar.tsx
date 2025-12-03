"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductTableToolbarProps<TData> {
    table: Table<TData>;
}

export function ProductTableToolbar<TData>({
    table,
}: ProductTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [filterValue, setFilterValue] = useState<string>(
        (table.getColumn("name")?.getFilterValue() as string) ?? ""
    );

    // Sync local state with table filter
    useEffect(() => {
        const tableFilterValue = (table.getColumn("name")?.getFilterValue() as string) ?? "";
        if (tableFilterValue !== filterValue) {
            setFilterValue(tableFilterValue);
        }
    }, [table.getState().columnFilters]);

    const handleFilterChange = (value: string) => {
        setFilterValue(value);
        table.getColumn("name")?.setFilterValue(value);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter products..."
                    value={filterValue}
                    onChange={(event) => handleFilterChange(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                            setFilterValue("");
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

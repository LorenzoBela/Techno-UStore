"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

interface ProductFiltersProps {
    categories: string[];
    selectedCategories: string[];
    onCategoryChange: (category: string, checked: boolean) => void;
    priceRange: [number, number];
    onPriceRangeChange: (value: [number, number]) => void;
    minPrice: number;
    maxPrice: number;
    onReset: () => void;
}

export function ProductFilters({
    categories,
    selectedCategories,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    minPrice,
    maxPrice,
    onReset,
}: ProductFiltersProps) {
    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
                    <X className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="grid gap-2">
                        {categories.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`category-${category}`}
                                    checked={selectedCategories.includes(category)}
                                    onCheckedChange={(checked) =>
                                        onCategoryChange(category, checked === true)
                                    }
                                />
                                <Label
                                    htmlFor={`category-${category}`}
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {category}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Price Range</Label>
                        <span className="text-xs text-muted-foreground">
                            ₱{priceRange[0]} - ₱{priceRange[1]}
                        </span>
                    </div>
                    <Slider
                        defaultValue={[minPrice, maxPrice]}
                        value={[priceRange[0], priceRange[1]]}
                        min={minPrice}
                        max={maxPrice}
                        step={10}
                        onValueChange={(value: number[]) => onPriceRangeChange(value as [number, number])}
                        className="py-4"
                    />
                </div>
            </div>
        </div>
    );
}

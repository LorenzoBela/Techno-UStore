"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    GripVertical,
    FolderTree,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
    getCategoriesWithSubcategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    migrateSubcategories,
    type CategoryWithSubcategories,
} from "./category-actions";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Expanded state for categories
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Dialog states
    const [categoryDialog, setCategoryDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        category?: CategoryWithSubcategories;
    }>({ open: false, mode: "create" });

    const [subcategoryDialog, setSubcategoryDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        categoryId?: string;
        categoryName?: string;
        subcategory?: { id: string; name: string };
    }>({ open: false, mode: "create" });

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "category" | "subcategory";
        id: string;
        name: string;
        productCount: number;
    } | null>(null);

    // Form states
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        image: "",
        isActive: true,
    });

    const [subcategoryForm, setSubcategoryForm] = useState({
        name: "",
    });

    // Fetch categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        setLoading(true);
        const data = await getCategoriesWithSubcategories();
        setCategories(data);
        setLoading(false);
    }

    function toggleExpanded(categoryId: string) {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    }

    // Category handlers
    function openCreateCategory() {
        setCategoryForm({ name: "", description: "", image: "", isActive: true });
        setCategoryDialog({ open: true, mode: "create" });
    }

    function openEditCategory(category: CategoryWithSubcategories) {
        setCategoryForm({
            name: category.name,
            description: category.description || "",
            image: category.image || "",
            isActive: category.isActive,
        });
        setCategoryDialog({ open: true, mode: "edit", category });
    }

    async function handleCategorySubmit() {
        if (!categoryForm.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        startTransition(async () => {
            if (categoryDialog.mode === "create") {
                const result = await createCategory({
                    name: categoryForm.name.trim(),
                    description: categoryForm.description.trim() || undefined,
                    image: categoryForm.image.trim() || undefined,
                    isActive: categoryForm.isActive,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Category created successfully");
                    setCategoryDialog({ open: false, mode: "create" });
                    loadCategories();
                }
            } else if (categoryDialog.category) {
                const result = await updateCategory(categoryDialog.category.id, {
                    name: categoryForm.name.trim(),
                    description: categoryForm.description.trim() || undefined,
                    image: categoryForm.image.trim() || undefined,
                    isActive: categoryForm.isActive,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Category updated successfully");
                    setCategoryDialog({ open: false, mode: "create" });
                    loadCategories();
                }
            }
        });
    }

    async function handleDeleteCategory() {
        if (!deleteDialog || deleteDialog.type !== "category") return;

        startTransition(async () => {
            const result = await deleteCategory(deleteDialog.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Category deleted successfully");
                setDeleteDialog(null);
                loadCategories();
            }
        });
    }

    // Subcategory handlers
    function openCreateSubcategory(categoryId: string, categoryName: string) {
        setSubcategoryForm({ name: "" });
        setSubcategoryDialog({ open: true, mode: "create", categoryId, categoryName });
    }

    function openEditSubcategory(
        categoryId: string,
        categoryName: string,
        subcategory: { id: string; name: string }
    ) {
        setSubcategoryForm({ name: subcategory.name });
        setSubcategoryDialog({ open: true, mode: "edit", categoryId, categoryName, subcategory });
    }

    async function handleSubcategorySubmit() {
        if (!subcategoryForm.name.trim()) {
            toast.error("Subcategory name is required");
            return;
        }

        startTransition(async () => {
            if (subcategoryDialog.mode === "create" && subcategoryDialog.categoryId) {
                const result = await createSubcategory({
                    name: subcategoryForm.name.trim(),
                    categoryId: subcategoryDialog.categoryId,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Subcategory created successfully");
                    setSubcategoryDialog({ open: false, mode: "create" });
                    // Expand the category to show the new subcategory
                    if (subcategoryDialog.categoryId) {
                        setExpanded((prev) => new Set(prev).add(subcategoryDialog.categoryId!));
                    }
                    loadCategories();
                }
            } else if (subcategoryDialog.subcategory) {
                const result = await updateSubcategory(subcategoryDialog.subcategory.id, {
                    name: subcategoryForm.name.trim(),
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Subcategory updated successfully");
                    setSubcategoryDialog({ open: false, mode: "create" });
                    loadCategories();
                }
            }
        });
    }

    async function handleDeleteSubcategory() {
        if (!deleteDialog || deleteDialog.type !== "subcategory") return;

        startTransition(async () => {
            const result = await deleteSubcategory(deleteDialog.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Subcategory deleted successfully");
                setDeleteDialog(null);
                loadCategories();
            }
        });
    }

    // Toggle category active status
    async function toggleCategoryActive(category: CategoryWithSubcategories) {
        startTransition(async () => {
            const result = await updateCategory(category.id, {
                isActive: !category.isActive,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Category ${!category.isActive ? "shown" : "hidden"} in navbar`);
                loadCategories();
            }
        });
    }

    // Migrate subcategories
    async function handleMigrate() {
        startTransition(async () => {
            const result = await migrateSubcategories();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Migrated ${result.migrated} products to new subcategory structure`);
                loadCategories();
            }
        });
    }

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage product categories and subcategories. Changes will reflect in the navbar.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleMigrate} disabled={isPending}>
                        Migrate Legacy
                    </Button>
                    <Button onClick={openCreateCategory}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>
            </div>

            {/* Categories List */}
            <div className="rounded-md border">
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <FolderTree className="h-12 w-12 mb-4 opacity-50" />
                        <p>No categories yet</p>
                        <p className="text-sm">Create your first category to get started</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {categories.map((category) => (
                            <div key={category.id}>
                                {/* Category Row */}
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                                        !category.isActive && "opacity-60"
                                    )}
                                >
                                    <button
                                        onClick={() => toggleExpanded(category.id)}
                                        className="p-1 hover:bg-muted rounded"
                                    >
                                        {expanded.has(category.id) ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>

                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{category.name}</span>
                                            {!category.isActive && (
                                                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                                    Hidden
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {category.productCount} products • {category.subcategories.length} subcategories
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2 mr-2">
                                            <Label htmlFor={`active-${category.id}`} className="text-xs text-muted-foreground">
                                                Show in Navbar
                                            </Label>
                                            <Switch
                                                id={`active-${category.id}`}
                                                checked={category.isActive}
                                                onCheckedChange={() => toggleCategoryActive(category)}
                                                disabled={isPending}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openCreateSubcategory(category.id, category.name)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditCategory(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setDeleteDialog({
                                                    open: true,
                                                    type: "category",
                                                    id: category.id,
                                                    name: category.name,
                                                    productCount: category.productCount,
                                                })
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {expanded.has(category.id) && category.subcategories.length > 0 && (
                                    <div className="bg-muted/30 border-t">
                                        {category.subcategories.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="flex items-center gap-3 px-4 py-2 pl-16 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm">{sub.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({sub.productCount} products)
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEditSubcategory(category.id, category.name, sub)}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        setDeleteDialog({
                                                            open: true,
                                                            type: "subcategory",
                                                            id: sub.id,
                                                            name: sub.name,
                                                            productCount: sub.productCount,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Empty subcategories state */}
                                {expanded.has(category.id) && category.subcategories.length === 0 && (
                                    <div className="bg-muted/30 border-t px-4 py-4 pl-16">
                                        <p className="text-sm text-muted-foreground">
                                            No subcategories.{" "}
                                            <button
                                                className="text-primary hover:underline"
                                                onClick={() => openCreateSubcategory(category.id, category.name)}
                                            >
                                                Add one
                                            </button>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Dialog */}
            <Dialog open={categoryDialog.open} onOpenChange={(open) => setCategoryDialog({ ...categoryDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {categoryDialog.mode === "create" ? "Create Category" : "Edit Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {categoryDialog.mode === "create"
                                ? "Add a new product category. It will appear in the navbar."
                                : "Update the category details."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Name *</Label>
                            <Input
                                id="cat-name"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="e.g. Apparel"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Textarea
                                id="cat-desc"
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                placeholder="Optional description"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-image">Image URL</Label>
                            <Input
                                id="cat-image"
                                value={categoryForm.image}
                                onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                                placeholder="Optional image URL for navbar icon"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="cat-active">Show in Navbar</Label>
                            <Switch
                                id="cat-active"
                                checked={categoryForm.isActive}
                                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCategoryDialog({ open: false, mode: "create" })}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCategorySubmit} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {categoryDialog.mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subcategory Dialog */}
            <Dialog
                open={subcategoryDialog.open}
                onOpenChange={(open) => setSubcategoryDialog({ ...subcategoryDialog, open })}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {subcategoryDialog.mode === "create" ? "Create Subcategory" : "Edit Subcategory"}
                        </DialogTitle>
                        <DialogDescription>
                            {subcategoryDialog.mode === "create"
                                ? `Add a new subcategory to "${subcategoryDialog.categoryName}"`
                                : `Update subcategory in "${subcategoryDialog.categoryName}"`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sub-name">Name *</Label>
                            <Input
                                id="sub-name"
                                value={subcategoryForm.name}
                                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                                placeholder="e.g. T-Shirts"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSubcategoryDialog({ open: false, mode: "create" })}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubcategorySubmit} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {subcategoryDialog.mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete {deleteDialog?.type === "category" ? "Category" : "Subcategory"}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog?.name}"?
                            {deleteDialog?.productCount ? (
                                <span className="block mt-2 text-destructive">
                                    This {deleteDialog.type} has {deleteDialog.productCount} products and cannot be
                                    deleted. Please move or delete the products first.
                                </span>
                            ) : (
                                <span className="block mt-2">This action cannot be undone.</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={deleteDialog?.type === "category" ? handleDeleteCategory : handleDeleteSubcategory}
                            disabled={isPending || (deleteDialog?.productCount ?? 0) > 0}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


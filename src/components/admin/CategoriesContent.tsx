"use client";

import { useEffect, useState, useTransition } from "react";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
} from "@/app/admin/products/categories/category-actions";
import { cn } from "@/lib/utils";

export function CategoriesContent() {
    const { isMobile, isLoading: deviceLoading } = useDeviceDetect();
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        image: "",
        isActive: true,
    });

    const [subcategoryForm, setSubcategoryForm] = useState({ name: "" });

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
                    toast.success("Category created");
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
                    toast.success("Category updated");
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
                toast.success("Category deleted");
                setDeleteDialog(null);
                loadCategories();
            }
        });
    }

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
                    toast.success("Subcategory created");
                    setSubcategoryDialog({ open: false, mode: "create" });
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
                    toast.success("Subcategory updated");
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
                toast.success("Subcategory deleted");
                setDeleteDialog(null);
                loadCategories();
            }
        });
    }

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

    async function handleMigrate() {
        startTransition(async () => {
            const result = await migrateSubcategories();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Migrated ${result.migrated} products`);
                loadCategories();
            }
        });
    }

    if (loading || deviceLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Mobile View
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader 
                    title="Categories" 
                    showBack 
                    backHref="/admin/products"
                    action={
                        <Button size="icon" className="h-9 w-9" onClick={openCreateCategory}>
                            <Plus className="h-5 w-5" />
                        </Button>
                    }
                />
                
                <div className="flex-1 p-4 space-y-3">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">No categories yet</p>
                            <Button onClick={openCreateCategory}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <Card key={category.id} className={cn(!category.isActive && "opacity-60")}>
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-2 p-3">
                                        <button onClick={() => toggleExpanded(category.id)} className="p-1">
                                            {expanded.has(category.id) ? (
                                                <ChevronDown className="h-5 w-5" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0" onClick={() => toggleExpanded(category.id)}>
                                            <p className="font-medium truncate">{category.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {category.productCount} products • {category.subcategories.length} subcategories
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCategory(category)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {expanded.has(category.id) && (
                                        <div className="border-t bg-muted/30">
                                            {category.subcategories.map((sub) => (
                                                <div key={sub.id} className="flex items-center gap-2 px-4 py-2 pl-12 border-b last:border-0">
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm">{sub.name}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">({sub.productCount})</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSubcategory(category.id, category.name, sub)}>
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteDialog({ open: true, type: "subcategory", id: sub.id, name: sub.name, productCount: sub.productCount })}>
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <button className="w-full px-4 py-2 pl-12 text-sm text-primary text-left hover:bg-muted/50" onClick={() => openCreateSubcategory(category.id, category.name)}>
                                                + Add Subcategory
                                            </button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Mobile Sheets */}
                <Sheet open={categoryDialog.open} onOpenChange={(open) => setCategoryDialog({ ...categoryDialog, open })}>
                    <SheetContent side="bottom" className="h-[85vh]">
                        <SheetHeader>
                            <SheetTitle>{categoryDialog.mode === "create" ? "New Category" : "Edit Category"}</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Optional description" rows={3} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Show in Navbar</Label>
                                <Switch checked={categoryForm.isActive} onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })} />
                            </div>
                        </div>
                        <SheetFooter className="gap-2">
                            {categoryDialog.mode === "edit" && (
                                <Button variant="destructive" onClick={() => { setCategoryDialog({ open: false, mode: "create" }); setDeleteDialog({ open: true, type: "category", id: categoryDialog.category!.id, name: categoryDialog.category!.name, productCount: categoryDialog.category!.productCount }); }}>Delete</Button>
                            )}
                            <Button onClick={handleCategorySubmit} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {categoryDialog.mode === "create" ? "Create" : "Save"}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <Sheet open={subcategoryDialog.open} onOpenChange={(open) => setSubcategoryDialog({ ...subcategoryDialog, open })}>
                    <SheetContent side="bottom">
                        <SheetHeader>
                            <SheetTitle>{subcategoryDialog.mode === "create" ? "New Subcategory" : "Edit Subcategory"}</SheetTitle>
                            <SheetDescription>In "{subcategoryDialog.categoryName}"</SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input value={subcategoryForm.name} onChange={(e) => setSubcategoryForm({ name: e.target.value })} placeholder="Subcategory name" />
                            </div>
                        </div>
                        <SheetFooter className="gap-2">
                            <Button onClick={handleSubcategorySubmit} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {subcategoryDialog.mode === "create" ? "Create" : "Save"}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <Sheet open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
                    <SheetContent side="bottom">
                        <SheetHeader>
                            <SheetTitle>Delete {deleteDialog?.type}</SheetTitle>
                            <SheetDescription>
                                Delete "{deleteDialog?.name}"?
                                {deleteDialog?.productCount ? (
                                    <span className="block mt-2 text-destructive">Has {deleteDialog.productCount} products. Move or delete them first.</span>
                                ) : (
                                    <span className="block mt-2">This cannot be undone.</span>
                                )}
                            </SheetDescription>
                        </SheetHeader>
                        <SheetFooter className="gap-2 mt-4">
                            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={deleteDialog?.type === "category" ? handleDeleteCategory : handleDeleteSubcategory} disabled={isPending || (deleteDialog?.productCount ?? 0) > 0}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    // Desktop View - Same as before but with Dialog instead of Sheet
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage product categories and subcategories.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleMigrate} disabled={isPending}>Migrate Legacy</Button>
                    <Button onClick={openCreateCategory}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
                </div>
            </div>

            <div className="rounded-md border">
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <FolderTree className="h-12 w-12 mb-4 opacity-50" />
                        <p>No categories yet</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {categories.map((category) => (
                            <div key={category.id}>
                                <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors", !category.isActive && "opacity-60")}>
                                    <button onClick={() => toggleExpanded(category.id)} className="p-1 hover:bg-muted rounded">
                                        {expanded.has(category.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{category.name}</span>
                                            {!category.isActive && <span className="text-xs bg-muted px-2 py-0.5 rounded">Hidden</span>}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{category.productCount} products • {category.subcategories.length} subcategories</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`active-${category.id}`} className="text-xs text-muted-foreground">Show in Navbar</Label>
                                        <Switch id={`active-${category.id}`} checked={category.isActive} onCheckedChange={() => toggleCategoryActive(category)} disabled={isPending} />
                                        <Button variant="ghost" size="icon" onClick={() => openCreateSubcategory(category.id, category.name)}><Plus className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: "category", id: category.id, name: category.name, productCount: category.productCount })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                                {expanded.has(category.id) && category.subcategories.length > 0 && (
                                    <div className="bg-muted/30 border-t">
                                        {category.subcategories.map((sub) => (
                                            <div key={sub.id} className="flex items-center gap-3 px-4 py-2 pl-16 hover:bg-muted/50">
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm">{sub.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">({sub.productCount})</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSubcategory(category.id, category.name, sub)}><Pencil className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteDialog({ open: true, type: "subcategory", id: sub.id, name: sub.name, productCount: sub.productCount })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {expanded.has(category.id) && category.subcategories.length === 0 && (
                                    <div className="bg-muted/30 border-t px-4 py-4 pl-16">
                                        <p className="text-sm text-muted-foreground">No subcategories. <button className="text-primary hover:underline" onClick={() => openCreateSubcategory(category.id, category.name)}>Add one</button></p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Dialogs */}
            <Dialog open={categoryDialog.open} onOpenChange={(open) => setCategoryDialog({ ...categoryDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{categoryDialog.mode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name *</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" /></div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={3} /></div>
                        <div className="space-y-2"><Label>Image URL</Label><Input value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} /></div>
                        <div className="flex items-center justify-between"><Label>Show in Navbar</Label><Switch checked={categoryForm.isActive} onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryDialog({ open: false, mode: "create" })}>Cancel</Button>
                        <Button onClick={handleCategorySubmit} disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{categoryDialog.mode === "create" ? "Create" : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={subcategoryDialog.open} onOpenChange={(open) => setSubcategoryDialog({ ...subcategoryDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{subcategoryDialog.mode === "create" ? "Create Subcategory" : "Edit Subcategory"}</DialogTitle>
                        <DialogDescription>In "{subcategoryDialog.categoryName}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name *</Label><Input value={subcategoryForm.name} onChange={(e) => setSubcategoryForm({ name: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubcategoryDialog({ open: false, mode: "create" })}>Cancel</Button>
                        <Button onClick={handleSubcategorySubmit} disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{subcategoryDialog.mode === "create" ? "Create" : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Delete {deleteDialog?.type}</DialogTitle>
                        <DialogDescription>
                            Delete "{deleteDialog?.name}"?
                            {deleteDialog?.productCount ? <span className="block mt-2 text-destructive">Has {deleteDialog.productCount} products.</span> : <span className="block mt-2">This cannot be undone.</span>}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={deleteDialog?.type === "category" ? handleDeleteCategory : handleDeleteSubcategory} disabled={isPending || (deleteDialog?.productCount ?? 0) > 0}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


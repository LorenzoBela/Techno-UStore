"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        toast.success("Settings saved successfully");
    }

    return (
        <div className="space-y-6 p-10 pb-16 block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your store settings and preferences.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <div className="flex-1 lg:max-w-2xl">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                                <CardDescription>
                                    Update your store's name and contact details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={onSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="storeName">Store Name</Label>
                                        <Input
                                            id="storeName"
                                            defaultValue="Techno UStore"
                                            placeholder="Enter store name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Contact Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue="admin@technoustore.com"
                                            placeholder="Enter contact email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Input id="currency" defaultValue="PHP (₱)" disabled />
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            This is the default currency for your store.
                                        </p>
                                    </div>
                                    <Button type="submit">Save Changes</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    Configure how you want to receive notifications.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="orderAlerts"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            defaultChecked
                                        />
                                        <Label htmlFor="orderAlerts">New Order Alerts</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="stockAlerts"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            defaultChecked
                                        />
                                        <Label htmlFor="stockAlerts">Low Stock Alerts</Label>
                                    </div>
                                    <Button onClick={() => toast.success("Notification preferences saved")}>
                                        Save Preferences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

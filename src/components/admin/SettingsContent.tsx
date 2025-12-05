"use client";

import { useDeviceDetect, setDevicePreference } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function SettingsContent() {
    const { isMobile, isLoading, device } = useDeviceDetect();

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        toast.success("Settings saved successfully");
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Mobile View
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader title="Settings" />
                
                <div className="flex-1 p-4 space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Store Information</CardTitle>
                            <CardDescription className="text-xs">
                                Update your store's name and contact details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName" className="text-sm">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        defaultValue="Techno UStore"
                                        placeholder="Enter store name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">Contact Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue="admin@technoustore.com"
                                        placeholder="Enter contact email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency" className="text-sm">Currency</Label>
                                    <Input id="currency" defaultValue="PHP (₱)" disabled />
                                    <p className="text-xs text-muted-foreground">
                                        Default currency for your store.
                                    </p>
                                </div>
                                <Button type="submit" className="w-full">Save Changes</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Notifications</CardTitle>
                            <CardDescription className="text-xs">
                                Configure how you receive notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">New Order Alerts</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Get notified when a new order is placed
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">Low Stock Alerts</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Get notified when stock is running low
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => toast.success("Notification preferences saved")}
                            >
                                Save Preferences
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Display</CardTitle>
                            <CardDescription className="text-xs">
                                Manage display preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">Desktop Mode</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Force desktop view on this device
                                    </p>
                                </div>
                                <Switch 
                                    checked={device === 'desktop'}
                                    onCheckedChange={(checked) => {
                                        setDevicePreference(checked ? 'desktop' : 'mobile');
                                    }}
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => setDevicePreference('auto')}
                            >
                                Use Automatic Detection
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Desktop View
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Display Mode</CardTitle>
                                <CardDescription>
                                    Override automatic device detection.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Mobile Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Force mobile view on this device
                                        </p>
                                    </div>
                                    <Switch 
                                        checked={device === 'mobile'}
                                        onCheckedChange={(checked) => {
                                            setDevicePreference(checked ? 'mobile' : 'desktop');
                                        }}
                                    />
                                </div>
                                <Button 
                                    variant="outline"
                                    onClick={() => setDevicePreference('auto')}
                                >
                                    Use Automatic Detection
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}


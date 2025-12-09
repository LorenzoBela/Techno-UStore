"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/admin/CalendarDateRangePicker";
import { Download, DollarSign, CreditCard, TrendingUp, Users } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from "recharts";

interface ReportsContentProps {
    salesByCategory: { name: string; value: number }[];
    orderStatusDist: { name: string; value: number }[];
    inventoryHealth: { name: string; value: number; fill: string }[];
    userGrowth: { name: string; users: number }[];
    monthlyRevenue: { name: string; total: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ReportsContent({
    salesByCategory,
    orderStatusDist,
    inventoryHealth,
    userGrowth,
    monthlyRevenue
}: ReportsContentProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 h-screen">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground text-sm">Loading reports...</p>
                </div>
            </div>
        );
    }

    // Calculate summary metrics
    const totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr.total, 0);
    const totalOrders = orderStatusDist.reduce((acc, curr) => acc + curr.value, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalUsersGrowth = userGrowth.reduce((acc, curr) => acc + curr.users, 0);

    // Common Chart Component configurations
    const RevenueChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${value}`}
                    width={isMobile ? 40 : 60}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip
                    formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );

    const SalesCategoryChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={salesByCategory} margin={{ left: isMobile ? 0 : 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={isMobile ? 80 : 100}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Sales']}
                    contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen bg-background pb-8">
                <MobileHeader title="Analytics Reports" showBack backHref="/admin" />

                <div className="flex-1 p-4 space-y-4">
                    {/* Mobile Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                                <CardTitle className="text-xs font-medium">Revenue (YTD)</CardTitle>
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-lg font-bold">₱{totalRevenue.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                                <CardTitle className="text-xs font-medium">Avg Order</CardTitle>
                                <CreditCard className="h-3 w-3 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-lg font-bold">₱{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Revenue Overview</CardTitle>
                            <CardDescription>Monthly revenue performance</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <div className="h-[250px]">
                                <RevenueChart />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Sales by Category</CardTitle>
                            <CardDescription>Top performing product categories</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <div className="h-[300px]">
                                <SalesCategoryChart />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Order Status</CardTitle>
                            <CardDescription>Distribution of current orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={orderStatusDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={isMobile ? 50 : 60}
                                            outerRadius={isMobile ? 70 : 80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {orderStatusDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">User Growth</CardTitle>
                            <CardDescription>New user registrations (6mo)</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            width={30}
                                        />
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Desktop Layout
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
                <div className="flex items-center space-x-2">
                    <CalendarDateRangePicker />
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">+4% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Users (6mo)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalUsersGrowth}</div>
                        <p className="text-xs text-muted-foreground">User base growing steady</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesByCategory.length} cats</div>
                        <p className="text-xs text-muted-foreground">In active rotation</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Overview - Full width on top */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue performance for the current year.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px]">
                            <RevenueChart />
                        </div>
                    </CardContent>
                </Card>

                {/* Sales by Category & Order Status - Split row */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Sales by Category</CardTitle>
                        <CardDescription>Breakdown of sales across different product categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <SalesCategoryChart />
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                        <CardDescription>Current status of all orders in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderStatusDist}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {orderStatusDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Health & User Growth - Bottom row */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Inventory Health</CardTitle>
                        <CardDescription>Overview of stock levels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={inventoryHealth}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {inventoryHealth.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New user registrations over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

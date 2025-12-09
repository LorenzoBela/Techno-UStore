import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

async function getSystemLogs() {
    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                user: {
                    select: { name: true, email: true, role: true }
                }
            }
        });
        return logs;
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return [];
    }
}

export default async function LogsPage() {
    const logs = await getSystemLogs();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Entity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No logs found</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.user?.name || log.userEmail?.split('@')[0] || "System"}</span>
                                                <span className="text-xs text-muted-foreground">{log.user?.email || log.userEmail || "N/A"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={log.details || ""}>
                                            {log.details}
                                        </TableCell>
                                        <TableCell>
                                            {log.entityType && (
                                                <Badge variant="secondary">
                                                    {log.entityType}: {log.entityId}
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

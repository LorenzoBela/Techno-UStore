import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentUser {
    id: string;
    name: string;
    email: string;
    image?: string;
    createdAt: string;
}

interface RecentUsersWidgetProps {
    users: RecentUser[];
}

export function RecentUsersWidget({ users }: RecentUsersWidgetProps) {
    if (!users || users.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No users yet
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => {
                    const initials = user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                    return (
                        <TableRow key={user.id}>
                            <TableCell className="flex items-center gap-2 font-medium">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.image} alt={user.name} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-right">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

const UserButton = () => {
    const { data: session } = useSession();

    if (!session?.user) return null;

    const initials = session.user.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 border border-border transition-opacity hover:opacity-80">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold leading-none">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 shadow-elevated rounded-xl border-border">
                <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold text-foreground leading-none">
                            {session.user.name}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground leading-none mt-1">
                            {session.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors rounded-lg mx-1 my-0.5">
                    <User className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="p-2.5 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors rounded-lg mx-1 my-0.5"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm font-bold">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;

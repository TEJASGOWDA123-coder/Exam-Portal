"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    UserPlus,
    Trash2,
    Shield,
    ShieldCheck,
    Mail,
    User,
    Lock,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ManageAdmins() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");

    const isSuperAdmin = (session?.user as any)?.role === "superadmin";

    const fetchAdmins = async () => {
        try {
            const resp = await fetch("/api/users");
            if (resp.ok) {
                const data = await resp.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin");
        } else if (status === "authenticated") {
            if (!isSuperAdmin) {
                toast.error("Unauthorized access");
                router.push("/admin/dashboard");
            } else {
                fetchAdmins();
            }
        }
    }, [status, isSuperAdmin, router]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error("All fields are required");
            return;
        }

        setAdding(true);
        try {
            const resp = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (resp.ok) {
                toast.success("Admin added successfully");
                setName("");
                setEmail("");
                setPassword("");
                fetchAdmins();
            } else {
                const err = await resp.json();
                toast.error(err.error || "Failed to add admin");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteAdmin = async (id: string, adminName: string) => {
        if (id === session?.user?.id) {
            toast.error("You cannot delete yourself");
            return;
        }

        if (!confirm(`Are you sure you want to delete admin "${adminName}"?`)) return;

        try {
            const resp = await fetch(`/api/users?id=${id}`, {
                method: "DELETE",
            });

            if (resp.ok) {
                toast.success("Admin deleted successfully");
                fetchAdmins();
            } else {
                toast.error("Failed to delete admin");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in w-full pb-10 px-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
                    <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-title">Manage Admins</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Add and manage application administrators</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Admin Form */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-2xl shadow-card border border-border p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-primary" />
                            Add New Admin
                        </h2>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter name"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Login Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Admin Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full font-bold h-11" disabled={adding}>
                                {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                Create Admin Account
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Admins List */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="font-bold text-foreground">Current Administrators</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {admins.length === 0 ? (
                                <div className="p-12 text-center">
                                    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No admins found.</p>
                                </div>
                            ) : (
                                admins.map((admin) => (
                                    <div key={admin.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${admin.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {admin.role === 'superadmin' ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                                    {admin.name}
                                                    {admin.id === session?.user?.id && (
                                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">You</span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-muted-foreground font-medium">{admin.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${admin.role === 'superadmin' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                                {admin.role}
                                            </span>
                                            {admin.id !== session?.user?.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

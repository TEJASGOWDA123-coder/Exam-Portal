"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
    ShieldCheck, 
    Upload, 
    Trash2, 
    FileCode, 
    Plus, 
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SebConfig {
    id: string;
    name: string;
    configData: string;
    isActive: boolean;
    createdAt: string;
}

export default function SebAdminPage() {
    const [configs, setConfigs] = useState<SebConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");

    const fetchConfigs = async () => {
        try {
            const resp = await fetch("/api/admin/seb");
            if (resp.ok) {
                const data = await resp.json();
                setConfigs(data);
            }
        } catch (err) {
            console.error("Failed to fetch SEB configs:", err);
            toast.error("Failed to load configurations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".seb")) {
            toast.error("Please upload a valid .seb file");
            return;
        }

        setUploading(true);
        try {
            const text = await file.text();
            const resp = await fetch("/api/admin/seb", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: file.name.replace(".seb", ""),
                    configData: text,
                }),
            });

            if (resp.ok) {
                toast.success("SEB configuration uploaded successfully");
                fetchConfigs();
            } else {
                const error = await resp.json();
                throw new Error(error.error || "Upload failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to upload file");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const resp = await fetch(`/api/admin/seb?id=${id}`, {
                method: "DELETE",
            });

            if (resp.ok) {
                toast.success("Configuration deleted");
                setConfigs(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error("Failed to delete configuration");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const filteredConfigs = configs.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-title">SEB Manager</h1>
                        <p className="text-muted-foreground text-sm font-medium">Safe Exam Browser Configurations</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Input 
                            type="file" 
                            accept=".seb"
                            onChange={handleFileUpload}
                            className="hidden" 
                            id="seb-upload" 
                            disabled={uploading}
                        />
                        <Button asChild disabled={uploading} className="shadow-lg shadow-primary/20 h-12 px-6 rounded-xl font-bold">
                            <label htmlFor="seb-upload" className="cursor-pointer">
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                Upload .seb File
                            </label>
                        </Button>
                    </div>
                </div>
            </header>

            <section className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search configurations..." 
                        className="pl-10 h-12 bg-card border-border rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </section>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-muted/50 animate-pulse border border-border" />
                    ))}
                </div>
            ) : filteredConfigs.length === 0 ? (
                <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center bg-transparent">
                    <FileCode className="w-16 h-16 text-muted-foreground/20 mb-4" />
                    <h3 className="text-xl font-bold text-muted-foreground">No configurations found</h3>
                    <p className="text-sm text-muted-foreground/60 mt-1">Upload your first .seb file to get started</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredConfigs.map((config) => (
                            <motion.div
                                key={config.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-xl transition-all duration-300 group rounded-3xl h-full flex flex-col">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                                                <FileCode className="w-6 h-6" />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => handleDelete(config.id, config.name)}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="mt-4">
                                            <CardTitle className="text-lg font-bold truncate pr-4">{config.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1.5 mt-1 text-[11px] font-medium uppercase tracking-wider">
                                                <Clock className="w-3 h-3" />
                                                Added {new Date(config.createdAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 pt-0">
                                        <div className="mt-4 flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type: Configuration</span>
                                            </div>
                                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-tighter">
                                                READY
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-4 bg-muted/20 border-t border-border mt-auto">
                                        <p className="text-[10px] text-muted-foreground font-medium truncate">
                                            ID: {config.id}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <div className="mt-16 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-primary mt-1" />
                    <div>
                        <h4 className="font-bold text-lg mb-2">About SEB Integration</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Safe Exam Browser configurations uploaded here can be linked to specific exams. When a student starts an exam with an SEB configuration, their browser environment will be strictly controlled according to the settings defined in the uploaded file.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

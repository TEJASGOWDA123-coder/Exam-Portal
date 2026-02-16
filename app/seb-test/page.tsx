"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Upload, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SebConfig {
  id: string;
  name: string;
  configData: string;
  isActive: boolean;
  createdAt: string;
}

export default function SebTestPage() {
  const [configs, setConfigs] = useState<SebConfig[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/seb-test/configs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConfigs(data);
      }
    } catch (error) {
      toast.error("Failed to fetch configurations");
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const configData = event.target?.result as string;
        const res = await fetch("/api/seb-test/configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, configData }),
        });

        if (res.ok) {
          toast.success("SEB Config uploaded successfully");
          setFile(null);
          // Reset file input
          const input = document.getElementById("seb-file") as HTMLInputElement;
          if (input) input.value = "";
          fetchConfigs();
        } else {
          toast.error("Upload failed");
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/seb-test/configs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Config ${!currentStatus ? "activated" : "deactivated"}`);
        fetchConfigs();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const res = await fetch(`/api/seb-test/configs?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Config deleted");
        fetchConfigs();
      }
    } catch (error) {
      toast.error("Failed to delete config");
    }
  };

  const launchConfig = (config: SebConfig) => {
    try {
      const blob = new Blob([config.configData], { type: "application/x-safeexambrowser-config" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = config.name.endsWith(".seb") ? config.name : `${config.name}.seb`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Launching SEB Configuration...");
    } catch (error) {
      toast.error("Failed to launch configuration");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">SEB Testing Sandbox</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage Safe Exam Browser configurations. This is an isolated test environment.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload SEB Configuration
            </CardTitle>
            <CardDescription>
              Upload a .seb file to test the configuration storage and auto-start logic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="seb-file">Select SEB File</Label>
                <Input
                  id="seb-file"
                  type="file"
                  accept=".seb"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
              <Button disabled={!file || loading} type="submit" className="w-full md:w-auto">
                {loading ? "Uploading..." : "Upload Configuration"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configured SEB Profiles</CardTitle>
            <CardDescription>
              Manage your uploaded configurations and toggle "Auto-start" mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <p className="text-center py-4 text-muted-foreground">Loading configurations...</p>
            ) : configs.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/50">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No SEB configurations found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      config.isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{config.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Uploaded: {new Date(config.createdAt).toLocaleString()}
                      </span>
                      {config.isActive && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Auto-start Enabled
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 mr-2">
                        <Label htmlFor={`active-${config.id}`} className="text-xs cursor-pointer">
                          Auto-start
                        </Label>
                        <Switch
                          id={`active-${config.id}`}
                          checked={config.isActive}
                          onCheckedChange={() => toggleActive(config.id, config.isActive)}
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => launchConfig(config)}
                      >
                        <Play className="h-4 w-4" />
                        Launch
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => deleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl flex items-start gap-4">
          <Play className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-primary">Simulation Hint</h3>
            <p className="text-sm text-primary/80 mt-1">
              "Auto-start" logic is simulated here. In a production environment, enabling this would 
              configure the system to automatically launch this SEB profile when a student begins an exam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

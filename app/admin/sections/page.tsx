"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Settings2,
  Save,
  Layout,
  MessageSquare,
  Workflow,
  Sparkles,
  ShieldCheck,
  LayoutTemplate
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Section {
  id: string;
  name: string;
  description: string;
  identityPrompt: string;
  transformationPrompt: string;
  validationRules: string;
  isActive: boolean;
}

export default function SectionManagement() {
  const [sections, setSections] = useState<Section[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autofilling, setAutofilling] = useState(false);
  const [formData, setFormData] = useState<Partial<Section>>({
    name: "",
    description: "",
    identityPrompt: "",
    transformationPrompt: "",
    validationRules: "{}",
  });

  const handleAutofill = async () => {
    if (!formData.name) {
      toast.error("Enter a section name first");
      return;
    }

    setAutofilling(true);
    const toastId = toast.loading("AI is crafting the persona...");
    try {
      const resp = await fetch("/api/sections/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionName: formData.name }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setFormData({
          ...formData,
          description: data.description,
          identityPrompt: data.identityPrompt,
          transformationPrompt: data.transformationPrompt,
          validationRules: JSON.stringify(data.validationRules, null, 2),
        });
        toast.success("Identity crafted! Review and Save.", { id: toastId });
      } else {
        throw new Error(data.error || "Failed to autofill");
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setAutofilling(false);
    }
  };

  const fetchSections = async () => {
    try {
      const resp = await fetch("/api/sections");
      const data = await resp.json();
      const cleaned = data.map((s: any) => {
        try {
          if (!s.validationRules) return s;
          let parsed = JSON.parse(s.validationRules);
          // If it's still a string after one parse, parse again (double stringification fix)
          if (typeof parsed === "string") parsed = JSON.parse(parsed);
          return { ...s, validationRules: JSON.stringify(parsed, null, 2) };
        } catch (e) {
          return s;
        }
      });
      setSections(cleaned);
    } catch (err) {
      toast.error("Failed to load sections");
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.identityPrompt) {
      toast.error("Name and Identity Prompt are required");
      return;
    }

    const toastId = toast.loading(editingId ? "Updating..." : "Creating...");
    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const resp = await fetch("/api/sections", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        toast.success(editingId ? "Section updated" : "Section created", { id: toastId });
        setEditingId(null);
        setFormData({ name: "", description: "", identityPrompt: "", transformationPrompt: "", validationRules: "{}" });
        fetchSections();
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Error saving section", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the section template.")) return;

    const toastId = toast.loading("Deleting...");
    try {
      const resp = await fetch(`/api/sections?id=${id}`, { method: "DELETE" });
      if (resp.ok) {
        toast.success("Section removed", { id: toastId });
        fetchSections();
      }
    } catch (err) {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const filteredSections = sections.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="w-full animate-fade-in pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
            <LayoutTemplate className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-title">Section Templates</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage AI identities for different exam sections</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", identityPrompt: "", transformationPrompt: "", validationRules: "{}" });
          }}
          className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List View */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border-border shadow-sm rounded-xl"
            />
          </div>

          <div className="space-y-3">
            {filteredSections.map(section => (
              <Card
                key={section.id}
                onClick={() => {
                  setEditingId(section.id);
                  setFormData(section);
                }}
                className={`p-4 cursor-pointer transition-all border shadow-sm rounded-xl ${editingId === section.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "bg-card border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{section.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(section.id);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{section.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Editor View */}
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8 rounded-2xl shadow-card border border-border bg-card">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg hidden md:block">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingId ? "Edit Identity Template" : "New Identity Template"}
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {formData.name || "UNNAMED"}
                  </p>
                </div>
              </div>
              <Button onClick={handleSave} className="font-bold shadow-lg h-10">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Section Name</Label>
                    <button
                      onClick={handleAutofill}
                      disabled={autofilling}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 ${autofilling ? "animate-pulse" : ""}`} />
                      {autofilling ? "Crafting..." : "Magic Autofill"}
                    </button>
                  </div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Quantum Physics"
                    className="h-10 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description for classification..."
                    className="h-24 resize-none"
                  />
                </div>

                <div className="p-4 bg-muted/20 rounded-xl border border-dashed border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Validation Rules (JSON)</Label>
                  </div>
                  <Textarea
                    value={formData.validationRules}
                    onChange={(e) => setFormData({ ...formData, validationRules: e.target.value })}
                    placeholder='{"mustContainDigits": true}'
                    className="font-mono text-xs h-24 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <Label>Identity Prompt (AI Persona)</Label>
                  </div>
                  <Textarea
                    value={formData.identityPrompt}
                    onChange={(e) => setFormData({ ...formData, identityPrompt: e.target.value })}
                    placeholder="You are an expert in..."
                    className="h-40 text-sm leading-relaxed border-border focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-4 h-4 text-purple-500" />
                    <Label>Transformation Logic</Label>
                  </div>
                  <Textarea
                    value={formData.transformationPrompt}
                    onChange={(e) => setFormData({ ...formData, transformationPrompt: e.target.value })}
                    placeholder="Transform topics into..."
                    className="h-32 text-sm leading-relaxed border-border focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

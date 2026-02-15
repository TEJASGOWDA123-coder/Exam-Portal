"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Settings2, 
  Save, 
  ChevronRight, 
  MessageSquare, 
  Workflow, 
  ShieldCheck,
  Sparkles,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-emerald-500" />
            Section Templates
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage AI identities and validation rules for exam sections.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", identityPrompt: "", transformationPrompt: "", validationRules: "{}" });
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List View */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search sections..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 shadow-sm"
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
                className={`p-4 cursor-pointer transition-all border-none shadow-sm ${
                  editingId === section.id 
                  ? "ring-2 ring-emerald-500 bg-emerald-50/30" 
                  : "hover:bg-white bg-slate-100/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-700">{section.name}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(section.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{section.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Editor View */}
        <div className="lg:col-span-8">
          <Card className="p-6 border-none shadow-xl bg-white min-h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 uppercase tracking-tight">
                    {editingId ? "Edit Identity Template" : "New Identity Template"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {formData.name || "UNNAMED"}
                  </p>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-slate-900 hover:bg-black text-white px-6 font-bold shadow-lg transform active:scale-95 transition-all">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 flex-1">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5 ">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Section Name</Label>
                    <button 
                      onClick={handleAutofill}
                      disabled={autofilling}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 ${autofilling ? "animate-pulse" : ""}`} />
                      {autofilling ? "Crafting..." : "Magic Autofill"}
                    </button>
                  </div>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Quantum Physics" 
                    className="h-10 font-bold"
                  />
                </div>

                <div>
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Short Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Visible to the RAG Agent for classification..." 
                    className="h-20 resize-none pt-3"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <Label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Validation Rules (JSON)</Label>
                  </div>
                  <Textarea 
                    value={formData.validationRules}
                    onChange={(e) => setFormData({...formData, validationRules: e.target.value})}
                    placeholder='{"mustContainDigits": true, "minWordCount": 5}' 
                    className="font-mono text-[10px] h-24 bg-white"
                  />
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">Define rules that the AI must follow when generating questions.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Prompt (AI Persona)</Label>
                  </div>
                  <Textarea 
                    value={formData.identityPrompt}
                    onChange={(e) => setFormData({...formData, identityPrompt: e.target.value})}
                    placeholder="You are an expert in... Frame questions that..." 
                    className="h-32 text-xs pt-3 leading-relaxed border-slate-200 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Workflow className="w-3.5 h-3.5 text-purple-500" />
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transformation Logic</Label>
                  </div>
                  <Textarea 
                    value={formData.transformationPrompt}
                    onChange={(e) => setFormData({...formData, transformationPrompt: e.target.value})}
                    placeholder="If the topic is X, transform it into Y..." 
                    className="h-32 text-xs pt-3 leading-relaxed border-slate-200 focus:border-purple-500 transition-colors"
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

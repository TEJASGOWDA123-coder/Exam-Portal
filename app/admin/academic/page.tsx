"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  Calendar, 
  Layers, 
  Loader2,
  Building2,
  ChevronRight
} from "lucide-react";

type AcademicItem = {
  id: string;
  name: string;
  code?: string;
  departmentId?: string;
  yearId?: string;
  createdAt: string;
};

export default function AcademicManagement() {
  const [departments, setDepartments] = useState<AcademicItem[]>([]);
  const [years, setYears] = useState<AcademicItem[]>([]);
  const [sections, setSections] = useState<AcademicItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  const [newYear, setNewYear] = useState({ name: "", departmentId: "" });
  const [newSection, setNewSection] = useState({ name: "", departmentId: "", yearId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptsRes, yearsRes, sectionsRes] = await Promise.all([
        fetch("/api/academic/departments"),
        fetch("/api/academic/years"),
        fetch("/api/academic/sections"),
      ]);

      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (yearsRes.ok) setYears(await yearsRes.json());
      if (sectionsRes.ok) setSections(await sectionsRes.json());
    } catch (error) {
      toast.error("Failed to load academic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;

    try {
      const res = await fetch("/api/academic/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDept),
      });

      if (res.ok) {
        toast.success("Department added");
        setNewDept({ name: "", code: "" });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add department");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.name || !newYear.departmentId) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/academic/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newYear),
      });

      if (res.ok) {
        toast.success("Year added");
        setNewYear({ name: "", departmentId: "" });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add year");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.name || !newSection.yearId) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/academic/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSection.name, yearId: newSection.yearId }),
      });

      if (res.ok) {
        toast.success("Section added");
        setNewSection({ name: "", departmentId: "", yearId: "" });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add section");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (type: "departments" | "years" | "sections", id: string) => {
    try {
      const res = await fetch(`/api/academic/${type}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Item deleted");
        fetchData();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Helpers for display
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || "Unknown Dept";
  const getYearName = (id: string) => years.find(y => y.id === id)?.name || "Unknown Year";

  if (loading && departments.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
        <p className="text-muted-foreground">
          Define hierarchical Departments, Years, and Sections.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="departments" className="gap-2 font-bold rounded-lg">
            <Building2 className="h-4 w-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="years" className="gap-2 font-bold rounded-lg">
            <Calendar className="h-4 w-4" /> Years
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2 font-bold rounded-lg">
            <Layers className="h-4 w-4" /> Sections
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card className="p-6 border-border shadow-sm">
            <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input 
                  id="dept-name" 
                  value={newDept.name} 
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Computer Science" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-code">Code</Label>
                <Input 
                  id="dept-code" 
                  value={newDept.code} 
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CSE" 
                />
              </div>
              <Button type="submit" className="font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Department
              </Button>
            </form>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id} className="w-fit h-fit flex flex-row items-center justify-between p-2 border-border bg-card/50 hover:bg-card transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {dept.code}
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-sm">{dept.name}</p>
                    <p className="text-[7px] text-muted-foreground">ID: {dept.id}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete("departments", dept.id)}
                  className=" cursor-pointer group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Years Tab */}
        <TabsContent value="years" className="space-y-6">
          <Card className="p-6 border-border shadow-sm">
            <form onSubmit={handleAddYear} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Select Department</Label>
                <Select value={newYear.departmentId} onValueChange={(val) => setNewYear({ ...newYear, departmentId: val })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year-name">Year Name</Label>
                <Input 
                  id="year-name" 
                  value={newYear.name} 
                  onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                  placeholder="e.g. 1st Year or 2024" 
                />
              </div>
              <Button type="submit" className="font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Year
              </Button>
            </form>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {years.map((year) => (
              <Card key={year.id} className=" w-fit h-fit p-4 flex flex-row items-center justify-between border-border bg-card/50 hover:bg-card transition-colors group">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1">
                    <Building2 className="h-2 w-2" /> {getDeptName(year.departmentId!)}
                  </span>
                  <p className="text-[10px] font-bold text-sm">{year.name}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete("years", year.id)}
                  className="group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <Card className="p-6 border-border shadow-sm">
            <form onSubmit={handleAddSection} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={newSection.departmentId} onValueChange={(val) => setNewSection({ ...newSection, departmentId: val, yearId: "" })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year (Filtered)</Label>
                <Select 
                  disabled={!newSection.departmentId} 
                  value={newSection.yearId} 
                  onValueChange={(val) => setNewSection({ ...newSection, yearId: val })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.filter(y => y.departmentId === newSection.departmentId).map((year) => (
                      <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sec-name">Section Name</Label>
                <Input 
                  id="sec-name" 
                  value={newSection.name} 
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value.toUpperCase() })}
                  placeholder="e.g. A" 
                />
              </div>
              <Button type="submit" className="font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Section
              </Button>
            </form>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sections.map((sec) => (
              <Card key={sec.id} className="w-fit h-fit p-4 flex flex-row items-center justify-between border-border bg-card/50 hover:bg-card transition-colors group">
                <div className="flex flex-col">
                  <div className="w-full flex items-center gap-1 text-[8px] uppercase font-bold text-muted-foreground mb-1">
                    <span>{getDeptName(years.find(y => y.id === sec.yearId)?.departmentId || "")}</span>
                    <ChevronRight className="h-2 w-2" />
                    <span>{getYearName(sec.yearId!)}</span>
                  </div>
                  <p className="font-bold text-sm tracking-widest">{sec.name}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete("sections", sec.id)}
                  className=" group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

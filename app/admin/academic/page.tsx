"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight,
  Search,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Search states
  const [deptSearch, setDeptSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");

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
    if (!newDept.name || !newDept.code) {
      toast.error("Please provide both name and code");
      return;
    }

    try {
      const res = await fetch("/api/academic/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDept),
      });

      if (res.ok) {
        toast.success("Department added successfully");
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
        toast.success("Academic year added");
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
        toast.success("Section created successfully");
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
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/academic/${type}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Item removed");
        fetchData();
      } else {
        toast.error("Failed to delete item. It might be in use.");
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
      <div className="flex h-[500px] flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading academic ecosystem...</p>
      </div>
    );
  }

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) || 
    d.code?.toLowerCase().includes(deptSearch.toLowerCase())
  );
  
  const filteredYears = years.filter(y => 
    y.name.toLowerCase().includes(yearSearch.toLowerCase()) ||
    getDeptName(y.departmentId!).toLowerCase().includes(yearSearch.toLowerCase())
  );

  const filteredSections = sections.filter(s => 
    s.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
    getYearName(s.yearId!).toLowerCase().includes(sectionSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Administration</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Academic Structure</h1>
          <p className="text-muted-foreground text-lg">
            Manage your institution's hierarchy from departments down to individual sections.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-full border border-border/50 backdrop-blur-sm">
          <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
            {departments.length} Departments
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
            {years.length} Years
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
            {sections.length} Sections
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-10 h-14 bg-muted/40 p-1.5 rounded-2xl border border-border/50">
          <TabsTrigger value="departments" className="gap-2.5 font-bold rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all duration-300">
            <GraduationCap className="h-5 w-5" /> Departments
          </TabsTrigger>
          <TabsTrigger value="years" className="gap-2.5 font-bold rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all duration-300">
            <Calendar className="h-5 w-5" /> Academic Years
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2.5 font-bold rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all duration-300">
            <Layers className="h-5 w-5" /> Class Sections
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 h-fit shadow-xl border-primary/10 bg-gradient-to-br from-card to-muted/30 sticky top-24">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <CardTitle>New Department</CardTitle>
                <CardDescription>Create a main academic unit like Engineering or Arts.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDept} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="dept-name">Department Name</Label>
                    <Input 
                      id="dept-name" 
                      value={newDept.name} 
                      onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                      placeholder="e.g. Computer Science" 
                      className="bg-background/50 border-primary/20 focus:border-primary transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-code">Department Code</Label>
                    <Input 
                      id="dept-code" 
                      value={newDept.code} 
                      onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. CSE" 
                      className="bg-background/50 border-primary/20 focus:border-primary transition-all rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full font-bold h-12 shadow-glow-emerald rounded-xl">
                    Create Department
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search departments..." 
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="pl-10 h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDepts.map((dept) => (
                  <Card key={dept.id} className="group relative overflow-hidden border-border bg-card hover:border-primary/50 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete("departments", dept.id)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                          {dept.code}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate leading-tight group-hover:text-primary transition-colors">{dept.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-1">
                            <Layers className="h-3 w-3" /> ID: {dept.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Badge variant="outline" className="rounded-full bg-muted/50 text-[10px]">
                            {years.filter(y => y.departmentId === dept.id).length} Years
                           </Badge>
                         </div>
                         <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {filteredDepts.length === 0 && (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
                  <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold">No departments found</h3>
                  <p className="text-muted-foreground">Start by creating your first department.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Years Tab */}
        <TabsContent value="years" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 h-fit shadow-xl border-primary/10 bg-gradient-to-br from-card to-muted/30 sticky top-24">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <CardTitle>Add Academic Year</CardTitle>
                <CardDescription>Assign academic years to specific departments.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddYear} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Assign to Department</Label>
                    <Select value={newYear.departmentId} onValueChange={(val) => setNewYear({ ...newYear, departmentId: val })}>
                      <SelectTrigger className="h-12 rounded-xl border-primary/20 bg-background/50">
                        <SelectValue placeholder="Choose Department" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl">
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id} className="rounded-lg m-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="h-5 w-8 flex justify-center p-0 text-[9px] border-primary/30">{dept.code}</Badge>
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year-name">Academic Year / Class</Label>
                    <Input 
                      id="year-name" 
                      value={newYear.name} 
                      onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                      placeholder="e.g. 1st Year or 2024-25" 
                      className="bg-background/50 border-primary/20 focus:border-primary transition-all rounded-xl h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full font-bold h-12 shadow-glow-emerald rounded-xl">
                    Add Academic Year
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search years or departments..." 
                  value={yearSearch}
                  onChange={(e) => setYearSearch(e.target.value)}
                  className="pl-10 h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredYears.map((year) => (
                  <Card key={year.id} className="group relative overflow-hidden border-border bg-card hover:border-primary/50 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete("years", year.id)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-5 flex flex-col h-full bg-gradient-to-br from-card to-muted/10 group-hover:to-primary/5 transition-all">
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight mb-2 border border-primary/5">
                          <Building2 className="h-3 w-3" /> {getDeptName(year.departmentId!)}
                        </div>
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{year.name}</h3>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="flex -space-x-2">
                             {[...Array(Math.min(3, sections.filter(s => s.yearId === year.id).length))].map((_, i) => (
                               <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                 {String.fromCharCode(65 + i)}
                               </div>
                             ))}
                           </div>
                           <span className="text-xs text-muted-foreground ml-2 font-medium">
                             {sections.filter(s => s.yearId === year.id).length} Sections
                           </span>
                         </div>
                         <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                           <ArrowRight className="h-4 w-4" />
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 h-fit shadow-xl border-primary/10 bg-gradient-to-br from-card to-muted/30 sticky top-24">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <CardTitle>Create Section</CardTitle>
                <CardDescription>Final tier: define specific class sections.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSection} className="space-y-5">
                  <div className="space-y-4 rounded-2xl bg-muted/40 p-4 border border-border/50">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={newSection.departmentId} onValueChange={(val) => setNewSection({ ...newSection, departmentId: val, yearId: "" })}>
                        <SelectTrigger className="h-11 rounded-xl bg-background border-border/50">
                          <SelectValue placeholder="Select Dept" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id} className="rounded-lg">{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select 
                        disabled={!newSection.departmentId} 
                        value={newSection.yearId} 
                        onValueChange={(val) => setNewSection({ ...newSection, yearId: val })}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-background border-border/50">
                          <SelectValue placeholder={newSection.departmentId ? "Select Year" : "Choose Dept First"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {years.filter(y => y.departmentId === newSection.departmentId).map((year) => (
                            <SelectItem key={year.id} value={year.id} className="rounded-lg">{year.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sec-name">Section Name / Identifer</Label>
                    <Input 
                      id="sec-name" 
                      value={newSection.name} 
                      onChange={(e) => setNewSection({ ...newSection, name: e.target.value.toUpperCase() })}
                      placeholder="e.g. A, B, or SECTION-1" 
                      className="bg-background/50 border-primary/20 focus:border-primary transition-all rounded-xl h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full font-bold h-12 shadow-glow-emerald rounded-xl">
                    Create Section
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search sections or parents..." 
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  className="pl-10 h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSections.map((sec) => {
                  const year = years.find(y => y.id === sec.yearId);
                  const dept = year ? departments.find(d => d.id === year.departmentId) : null;
                  
                  return (
                    <Card key={sec.id} className="group relative overflow-hidden border-border bg-card hover:border-primary hover:shadow-2xl transition-all duration-500 rounded-3xl">
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete("sections", sec.id)}
                          className="text-destructive hover:bg-destructive/10 h-7 w-7 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col gap-2 mb-4">
                           <div className="flex items-center gap-1.5 flex-wrap">
                             <Badge variant="outline" className="px-1.5 py-0 rounded text-[9px] font-bold border-primary/20 text-primary uppercase">
                               {dept?.code || "DEPT"}
                             </Badge>
                             <ChevronRight className="h-3 w-3 text-muted-foreground" />
                             <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                               {year?.name || "YEAR"}
                             </span>
                           </div>
                           <h3 className="font-black text-3xl group-hover:text-primary transition-colors tracking-widest">{sec.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 group/btn cursor-pointer">
                          <span className="text-xs font-bold text-muted-foreground group-hover/btn:text-primary transition-colors">Manage Section</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

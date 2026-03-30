"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Users,
  ArrowLeft,
  Save,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Department, Year, Section, AcademicConfig } from "@/lib/schema";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchAcademicDataThunk,
  modifyAcademicDataThunk,
} from "@/store/slices/academicSlice";
import { cn } from "@/lib/utils";
// ── Tab config ───────────────────────────────────────────────────────────────
type TabId = "departments" | "years" | "sections";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
}[] = [
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    accent: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    id: "years",
    label: "Years",
    icon: Calendar,
    accent: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    id: "sections",
    label: "Sections",
    icon: Users,
    accent: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const singularLabel = (tab: TabId) =>
  tab === "departments" ? "Department" : tab === "years" ? "Year" : "Section";

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────
function ItemCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  meta,
  onEdit,
  onDelete,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  meta: { label: string; value: string }[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card
                    hover:border-border/80 hover:shadow-sm hover:-translate-y-px
                    transition-all duration-150"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          iconBg,
        )}
      >
        <Icon className={cn("w-4.5 h-4.5", iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          {meta.map(({ label, value }) => (
            <span key={label} className="text-xs text-muted-foreground">
              <span className="font-semibold text-muted-foreground/70">
                {label}:
              </span>{" "}
              {value}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={onEdit}
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AcademicManagement() {
  const { academicConfig, loading } = useAppSelector((state) => state.academic);
  const dispatch = useAppDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>("departments");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    order: 1,
  });
  const [createSections, setCreateSections] = useState(true);
  const [createYears, setCreateYears] = useState(true);

  useEffect(() => {
    dispatch(fetchAcademicDataThunk());
  }, [dispatch]);

  // Validation functions to check for duplicates
  const checkDuplicateSection = (
    name: string,
    order: number,
    departmentId: string,
    excludeId?: string,
  ) => {
    return academicConfig.sections.some(
      (section) =>
        section.departmentId === departmentId &&
        section.name.toLowerCase() === name.toLowerCase() &&
        section.order === order &&
        section.id !== excludeId,
    );
  };

  const checkDuplicateYear = (
    name: string,
    order: number,
    departmentId: string,
    excludeId?: string,
  ) => {
    return academicConfig.years.some(
      (year) =>
        year.departmentId === departmentId &&
        year.name.toLowerCase() === name.toLowerCase() &&
        year.order === order &&
        year.id !== excludeId,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate for duplicates before submitting
      if (activeTab === "sections" && formData.departmentId) {
        if (
          checkDuplicateSection(
            formData.name,
            formData.order,
            formData.departmentId,
            editingItem?.id,
          )
        ) {
          toast.error(
            `Section "${formData.name}" with order ${formData.order} already exists in this department`,
          );
          setSubmitting(false);
          return;
        }
      }

      if (activeTab === "years" && formData.departmentId) {
        if (
          checkDuplicateYear(
            formData.name,
            formData.order,
            formData.departmentId,
            editingItem?.id,
          )
        ) {
          toast.error(
            `Year "${formData.name}" with order ${formData.order} already exists in this department`,
          );
          setSubmitting(false);
          return;
        }
      }

      // Handle multiple section creation when comma-separated names are provided
      if (
        activeTab === "sections" &&
        !editingItem &&
        formData.name.includes(",")
      ) {
        const sectionNames = formData.name
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name);

        // Check for duplicates in multiple section creation
        const duplicateSections = sectionNames.filter((sectionName) =>
          checkDuplicateSection(
            sectionName,
            formData.order,
            formData.departmentId,
          ),
        );

        if (duplicateSections.length > 0) {
          toast.error(
            `Sections already exist: ${duplicateSections.join(", ")}`,
          );
          setSubmitting(false);
          return;
        }

        const sectionPromises = sectionNames.map((sectionName) => {
          const sectionData = {
            ...formData,
            name: sectionName,
          };
          const payload = {
            type: "section",
            data: sectionData,
          };
          return fetch("/api/academic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        });

        const results = await Promise.all(sectionPromises);
        const allSuccessful = results.every((res) => res.ok);

        if (allSuccessful) {
          await dispatch(fetchAcademicDataThunk());
          toast.success(
            `Created ${sectionNames.length} sections: ${sectionNames.join(", ")}`,
          );
          handleCloseDialog();
        } else {
          toast.error("Some sections failed to create");
        }
      } else {
        // Handle single record creation (for all other cases)
        const payload: any = {
          type: activeTab.slice(0, -1),
          data: formData,
          ...(editingItem && { id: editingItem.id }),
          ...(activeTab === "departments" &&
            !editingItem && { createSections, createYears }),
        };
        try {
          await dispatch(
            modifyAcademicDataThunk({
              method: editingItem ? "PUT" : "POST",
              body: payload,
            }),
          ).unwrap();
          toast.success(
            editingItem
              ? `${singularLabel(activeTab)} updated`
              : `${singularLabel(activeTab)} created${activeTab === "departments" && createSections && createYears ? " with sections A, B, C and default years" : activeTab === "departments" && createSections ? " with sections A, B, C" : activeTab === "departments" && createYears ? " with default years" : ""}`,
          );
          handleCloseDialog();
        } catch (error: any) {
          toast.error(error || "Operation failed");
        }
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await dispatch(
        modifyAcademicDataThunk({
          method: "DELETE",
          body: { type: activeTab.slice(0, -1), id: deleteItem.id },
        }),
      ).unwrap();
      toast.success(`${singularLabel(activeTab)} deleted`);
      handleCloseDeleteDialog();
    } catch (error: any) {
      toast.error(error || "Delete failed");
    }
  };

  const handleOpenDialog = (item?: any) => {
    setEditingItem(item ?? null);
    setFormData(
      item
        ? {
            name: item.name,
            code: item.code || "",
            description: item.description || "",
            departmentId: item.departmentId || "",
            order: item.order || 1,
          }
        : {
            name: "",
            code: "",
            description: "",
            departmentId: "",
            order: 1,
          },
    );
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      departmentId: "",
      order: 1,
    });
    setCreateSections(true);
    setCreateYears(true);
  };

  const handleOpenDeleteDialog = (item: any) => {
    setDeleteItem(item);
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  const getFilteredYears = (deptId: string) =>
    academicConfig.years.filter((y) => y.departmentId === deptId);

  // ── Counts for tab badges ──────────────────────────────────────────────────
  const counts: Record<TabId, number> = {
    departments: academicConfig.departments.length,
    years: academicConfig.years.length,
    sections: academicConfig.sections.length,
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading academic data…
          </p>
        </div>
      </div>
    );
  }

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="w-full min-h-screen animate-fade-in pb-16 px-4 sm:px-6">
      {/* ── Header ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 mb-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-none">
              Academic Structure
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage departments, years, and sections
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-9 px-4 rounded-xl font-semibold text-xs shrink-0"
        >
          <Link href="/admin/dashboard">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Dashboard
          </Link>
        </Button>
      </div>

      {/* ── Summary stat row ─────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {TABS.map(({ id, label, icon: Icon, accent, bg }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "group flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-150",
              activeTab === id
                ? "border-primary/30 bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-border/80 hover:-translate-y-0.5 hover:shadow-sm",
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                bg,
              )}
            >
              <Icon className={cn("w-4 h-4", accent)} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-foreground tabular-nums leading-none">
                {counts[id]}
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
                {label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Tab bar ──────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150",
                activeTab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              {counts[id] > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    activeTab === id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          onClick={() => handleOpenDialog()}
          size="sm"
          className="h-9 px-4 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add {singularLabel(activeTab)}
        </Button>
      </div>

      {/* ── Content list ─────────────────────── */}
      <div
        className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
        key={activeTab}
      >
        {/* Departments */}
        {activeTab === "departments" &&
          academicConfig.departments.map((dept) => (
            <ItemCard
              key={dept.id}
              icon={Building2}
              iconBg={currentTab.bg}
              iconColor={currentTab.accent}
              title={dept.name}
              meta={[
                { label: "Code", value: dept.code },
                ...(dept.description
                  ? [{ label: "Note", value: dept.description }]
                  : []),
                {
                  label: "Years",
                  value: String(
                    academicConfig.years.filter(
                      (y) => y.departmentId === dept.id,
                    ).length,
                  ),
                },
                {
                  label: "Sections",
                  value: String(
                    academicConfig.sections.filter(
                      (s) => s.departmentId === dept.id,
                    ).length,
                  ),
                },
              ]}
              onEdit={() => handleOpenDialog(dept)}
              onDelete={() => handleOpenDeleteDialog(dept)}
            />
          ))}

        {/* Years */}
        {activeTab === "years" &&
          academicConfig.years.map((year) => {
            const dept = academicConfig.departments.find(
              (d) => d.id === year.departmentId,
            );
            return (
              <ItemCard
                key={year.id}
                icon={Calendar}
                iconBg={currentTab.bg}
                iconColor={currentTab.accent}
                title={year.name}
                meta={[
                  { label: "Dept", value: dept?.code ?? dept?.name ?? "—" },
                  { label: "Order", value: String(year.order) },
                  // {
                  //   label: "Sections",
                  //   value: String(
                  //     academicConfig.sections.filter(
                  //       (s) => s.yearId === year.id,
                  //     ).length,
                  //   ),
                  // },
                ]}
                onEdit={() => handleOpenDialog(year)}
                onDelete={() => handleOpenDeleteDialog(year)}
              />
            );
          })}

        {/* Sections */}
        {activeTab === "sections" &&
          [...academicConfig.sections]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section) => {
              const dept = academicConfig.departments.find(
                (d) => d.id === section.departmentId,
              );
              const year = academicConfig.years.find(
                (y) => y.id === section.yearId,
              );
              return (
                <ItemCard
                  key={section.id}
                  icon={Users}
                  iconBg={currentTab.bg}
                  iconColor={currentTab.accent}
                  title={`Section ${section.name}`}
                  meta={[
                    { label: "Order", value: String(section.order || 0) },
                    { label: "Dept", value: dept?.code ?? dept?.name ?? "—" },
                    // { label: "Year", value: year?.name ?? "—" },
                  ]}
                  onEdit={() => handleOpenDialog(section)}
                  onDelete={() => handleOpenDeleteDialog(section)}
                />
              );
            })}

        {/* Empty state */}
        {counts[activeTab] === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/10">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4",
                currentTab.bg,
              )}
            >
              <currentTab.icon className={cn("w-6 h-6", currentTab.accent)} />
            </div>
            <p className="font-bold text-muted-foreground text-sm">
              No {currentTab.label.toLowerCase()} yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 mb-5">
              Add your first {singularLabel(activeTab).toLowerCase()} to get
              started.
            </p>
            <Button
              size="sm"
              className="rounded-xl h-9 px-5 font-bold text-xs"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add {singularLabel(activeTab)}
            </Button>
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog ─────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingItem
                ? `Edit ${singularLabel(activeTab)}`
                : `Add ${singularLabel(activeTab)}`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingItem
                ? `Update the ${singularLabel(activeTab).toLowerCase()} details below.`
                : `Create a new ${singularLabel(activeTab).toLowerCase()} for your institution.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Departments form */}
            {activeTab === "departments" && (
              <>
                <Field label="Department Name *" htmlFor="name">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Master of Computer Applications"
                    required
                    className="h-10 rounded-xl"
                  />
                </Field>
                <Field label="Department Code *" htmlFor="code">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., MCA"
                    required
                    className="h-10 rounded-xl"
                  />
                </Field>
                <Field label="Description" htmlFor="desc">
                  <Input
                    id="desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description"
                    className="h-10 rounded-xl"
                  />
                </Field>
                {!editingItem && (
                  <>
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="createSectionsDept"
                        checked={createSections}
                        onChange={(e) => setCreateSections(e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label
                        htmlFor="createSectionsDept"
                        className="text-sm font-medium text-foreground"
                      >
                        Auto-create sections A, B, C
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="createYearsDept"
                        checked={createYears}
                        onChange={(e) => setCreateYears(e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label
                        htmlFor="createYearsDept"
                        className="text-sm font-medium text-foreground"
                      >
                        Auto-create default years (1st Year, 2nd Year, 3rd Year)
                      </Label>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Years form */}
            {activeTab === "years" && (
              <>
                <Field label="Department *">
                  <Select
                    value={formData.departmentId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, departmentId: v })
                    }
                    required
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicConfig.departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Year Name *" htmlFor="name">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., 1st Year"
                    required
                    className="h-10 rounded-xl"
                  />
                </Field>
                <Field
                  label="Order *"
                  htmlFor="order"
                  hint="Used to sort years chronologically"
                >
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    placeholder="1"
                    required
                    className="h-10 rounded-xl "
                  />
                </Field>
              </>
            )}

            {/* Sections form */}
            {activeTab === "sections" && (
              <>
                <Field label="Department *">
                  <Select
                    value={formData.departmentId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, departmentId: v })
                    }
                    required
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicConfig.departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Section Name *"
                  htmlFor="name"
                  hint="e.g., A or A, B, C (comma-separated for multiple)"
                >
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="A or A, B, C"
                    required
                    className="h-10 rounded-xl"
                  />
                </Field>
                <Field
                  label="Order *"
                  htmlFor="order"
                  hint="Display order for sections (e.g., 1, 2, 3)"
                >
                  <Input
                    id="order"
                    type="number"
                    value={formData.order || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="1"
                    required
                    className="h-10 rounded-xl"
                  />
                </Field>
              </>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseDialog}
                className="rounded-xl h-9 px-4 font-semibold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl h-9 px-5 font-bold text-xs shadow-sm shadow-primary/20"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1.5" />
                    {editingItem ? "Updating…" : "Creating…"}
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {editingItem ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ─────────────────────── */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete {singularLabel(activeTab)}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong className="text-foreground">{deleteItem?.name}</strong>{" "}
              will be permanently removed.
              {activeTab === "departments" &&
                " All associated years and sections will also be deleted."}
              {activeTab === "years" &&
                " All associated sections will also be deleted."}{" "}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

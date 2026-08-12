"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MaterialOption {
  id: string;
  name: string;
  unitType: string;
  pricePerUnitKobo: number;
}

const formSchema = z.object({
  projectType: z.string().min(1, "Project type required"),
  dimensionL: z.coerce.number().positive("Required"),
  dimensionW: z.coerce.number().positive("Required"),
  dimensionH: z.coerce.number().positive("Required"),
  complexity: z.enum(["standard", "complex", "bespoke"] as const),
  notes: z.string().optional(),
  materials: z
    .array(
      z.object({
        materialId: z.string().min(1),
        quantity: z.coerce.number().positive("Required"),
      }),
    )
    .min(1, "Add at least one material"),
  labourCostNaira: z.coerce.number().min(0),
  transportCostNaira: z.coerce.number().min(0),
  profitMarginPct: z.coerce.number().min(0).max(40),
});
type FormInput = z.input<typeof formSchema>;
type FormData = z.output<typeof formSchema>;

const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  standard: 1.0,
  complex: 1.35,
  bespoke: 1.7,
};

function formatNaira(naira: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(naira);
}

interface Props {
  project: {
    id: string;
    projectType: string;
    dimensionsMm: { l: number; w: number; h: number };
    complexity: string;
    notes: string | null;
    labourCostKobo: number;
    transportCostKobo: number;
    profitMarginPct: number;
    materials: Array<{ materialId: string; quantity: number }>;
  };
}

export function ProjectEditForm({ project }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [allMaterials, setAllMaterials] = useState<MaterialOption[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: project.projectType,
      dimensionL: project.dimensionsMm.l,
      dimensionW: project.dimensionsMm.w,
      dimensionH: project.dimensionsMm.h,
      complexity: project.complexity as "standard" | "complex" | "bespoke",
      notes: project.notes ?? "",
      labourCostNaira: project.labourCostKobo / 100,
      transportCostNaira: project.transportCostKobo / 100,
      profitMarginPct: project.profitMarginPct,
      materials: project.materials.map((m) => ({
        materialId: m.materialId,
        quantity: m.quantity,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "materials" });
  const watchedMaterials = useWatch({ control, name: "materials" }) || [];
  const labourNaira = Number(useWatch({ control, name: "labourCostNaira" })) || 0;
  const transportNaira = Number(useWatch({ control, name: "transportCostNaira" })) || 0;
  const profitPct = Number(useWatch({ control, name: "profitMarginPct" })) || 0;
  const complexity = useWatch({ control, name: "complexity" }) || "standard";

  useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data: { data?: MaterialOption[] }) => setAllMaterials(data.data ?? []))
      .catch(() => toast.error("Failed to load materials"));
  }, []);

  const materialCostNaira = watchedMaterials.reduce((sum, line) => {
    const mat = allMaterials.find((m) => m.id === line.materialId);
    return sum + (mat ? (mat.pricePerUnitKobo / 100) * (Number(line.quantity) || 0) : 0);
  }, 0);

  const baseCost = materialCostNaira + labourNaira + transportNaira;
  const withComplexity = baseCost * (COMPLEXITY_MULTIPLIERS[complexity] ?? 1);
  const profit = (withComplexity * profitPct) / 100;
  const total = withComplexity + profit;

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: data.projectType,
          dimensionsMm: { l: data.dimensionL, w: data.dimensionW, h: data.dimensionH },
          complexity: data.complexity,
          notes: data.notes,
          labourCostKobo: Math.round(data.labourCostNaira * 100),
          transportCostKobo: Math.round(data.transportCostNaira * 100),
          profitMarginPct: data.profitMarginPct,
          materials: data.materials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
          })),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Failed to update project");
        return;
      }
      toast.success("Project updated");
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="space-y-1.5">
              <Label>Project type *</Label>
              <Input {...register("projectType")} />
              {errors.projectType && (
                <p className="text-destructive text-xs">{errors.projectType.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {(["dimensionL", "dimensionW", "dimensionH"] as const).map((d, i) => (
                <div key={d} className="space-y-1.5">
                  <Label>{["Length", "Width", "Height"][i]} (mm)</Label>
                  <Input type="number" {...register(d)} />
                  {errors[d] && <p className="text-destructive text-xs">{errors[d]?.message}</p>}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Complexity</Label>
              <Select
                value={complexity}
                onValueChange={(v) => {
                  if (v) setValue("complexity", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (×1.0)</SelectItem>
                  <SelectItem value="complex">Complex (×1.35)</SelectItem>
                  <SelectItem value="bespoke">Bespoke (×1.7)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={3} className="resize-none" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Materials</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ materialId: "", quantity: 1 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, idx) => {
              const mat = allMaterials.find((m) => m.id === watchedMaterials[idx]?.materialId);
              const lineTotal = mat
                ? (mat.pricePerUnitKobo / 100) * (Number(watchedMaterials[idx]?.quantity) || 0)
                : 0;

              return (
                <div
                  key={field.id}
                  className="border-border flex items-end gap-3 rounded-xl border bg-white p-3 shadow-sm dark:bg-neutral-900"
                >
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                      Material
                    </Label>
                    <Select
                      value={watchedMaterials[idx]?.materialId ?? ""}
                      onValueChange={(v) => {
                        if (v) setValue(`materials.${idx}.materialId`, v);
                      }}
                    >
                      <SelectTrigger className="bg-muted/30 w-full border-0 shadow-none">
                        <SelectValue placeholder="Select material…" />
                      </SelectTrigger>
                      <SelectContent>
                        {allMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex flex-col py-0.5">
                              <span className="font-medium">{m.name}</span>
                              <span className="text-muted-foreground text-[10px] uppercase">
                                {formatNaira(m.pricePerUnitKobo / 100)} / {m.unitType}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-20 space-y-1.5 sm:w-24">
                    <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                      Qty
                    </Label>
                    <Input
                      type="number"
                      {...register(`materials.${idx}.quantity`)}
                      min={1}
                      className="bg-muted/30 border-0 text-center shadow-none"
                    />
                  </div>

                  <div className="w-24 pb-2.5 text-right font-mono text-sm font-medium sm:w-32">
                    {formatNaira(lineTotal)}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(idx)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            {errors.materials && (
              <p className="text-destructive mt-2 px-2 text-sm font-medium">
                {errors.materials.message ?? "Please add at least one material"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Costs &amp; Margin</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Labour Cost (₦)</Label>
              <Input type="number" {...register("labourCostNaira")} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Transport Cost (₦)</Label>
              <Input type="number" {...register("transportCostNaira")} min={0} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <Label>Profit Margin</Label>
                <span className="bg-inox-100 dark:bg-inox-900/50 text-inox-700 dark:text-inox-400 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-bold">
                  {profitPct}%
                </span>
              </div>
              <input
                type="range"
                {...register("profitMarginPct")}
                min={0}
                max={40}
                step={1}
                className="bg-muted accent-inox-600 h-2 w-full cursor-pointer appearance-none rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/projects/${project.id}`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-inox-600 hover:bg-inox-700 text-white"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="lg:col-span-4">
        <Card className="border-border sticky top-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Live Cost Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Materials</span>
              <span className="font-mono">{formatNaira(materialCostNaira)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Labour</span>
              <span className="font-mono">{formatNaira(labourNaira)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Transport</span>
              <span className="font-mono">{formatNaira(transportNaira)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Complexity</span>
              <span className="font-mono">× {COMPLEXITY_MULTIPLIERS[complexity]}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Profit ({profitPct}%)</span>
              <span className="font-mono">+{formatNaira(profit)}</span>
            </div>
            <div className="border-border mt-2 border-t-2 border-dashed pt-3">
              <div className="flex items-end justify-between">
                <span className="text-muted-foreground text-sm font-medium">Total</span>
                <span className="text-foreground text-2xl font-bold">{formatNaira(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

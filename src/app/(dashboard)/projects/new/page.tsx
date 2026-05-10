"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronRight, ChevronLeft, Check } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

// ── Types ────────────────────────────────────────────────────────────────────
interface MaterialOption {
  id: string;
  name: string;
  unitType: string;
  pricePerUnitKobo: number;
}
interface CustomerOption {
  id: string;
  name: string;
}

const formSchema = z.object({
  customerId: z.string().min(1, "Customer required"),
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
type FormData = z.infer<typeof formSchema>;

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

const STEPS = ["Customer", "Details", "Materials", "Costs", "Review"];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialOption[]>([]);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      complexity: "standard",
      profitMarginPct: 20,
      labourCostNaira: 0,
      transportCostNaira: 0,
      materials: [{ materialId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "materials" });
  const watchedMaterials = useWatch({ control, name: "materials" }) || [];
  const labourNaira = useWatch({ control, name: "labourCostNaira" }) || 0;
  const transportNaira = useWatch({ control, name: "transportCostNaira" }) || 0;
  const profitPct = useWatch({ control, name: "profitMarginPct" }) || 0;
  const complexity = useWatch({ control, name: "complexity" }) || "standard";
  const customerId = useWatch({ control, name: "customerId" });
  const projectType = useWatch({ control, name: "projectType" });
  const dimensionL = useWatch({ control, name: "dimensionL" });
  const dimensionW = useWatch({ control, name: "dimensionW" });
  const dimensionH = useWatch({ control, name: "dimensionH" });

  const materialCostNaira = watchedMaterials.reduce((sum, line) => {
    const mat = allMaterials.find((m) => m.id === line.materialId);
    return sum + (mat ? (mat.pricePerUnitKobo / 100) * (line.quantity || 0) : 0);
  }, 0);

  const baseCost = materialCostNaira + Number(labourNaira) + Number(transportNaira);
  const withComplexity = baseCost * (COMPLEXITY_MULTIPLIERS[complexity] ?? 1);
  const profit = (withComplexity * Number(profitPct)) / 100;
  const total = withComplexity + profit;

  const searchCustomers = async (q: string) => {
    if (!q) {
      setCustomers([]);
      return;
    }
    const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}`);
    const data = await res.json();
    setCustomers(data.items ?? []);
  };

  const loadMaterials = async () => {
    if (allMaterials.length > 0) return;
    const res = await fetch("/api/materials");
    const data = await res.json();
    setAllMaterials(data.items ?? []);
  };

  const createCustomer = async () => {
    setCreatingCustomer(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustomerName, phone: newCustomerPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      setValue("customerId", data.data.id);
      setSelectedCustomerName(data.data.name);
      setCreatingCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
    } catch {
      toast.error("Network error");
    } finally {
      setCreatingCustomer(false);
    }
  };

  const goNext = async () => {
    const fieldsToValidate: Record<number, (keyof FormData)[]> = {
      0: ["customerId"],
      1: ["projectType", "dimensionL", "dimensionW", "dimensionH", "complexity"],
      2: ["materials"],
      3: ["labourCostNaira", "transportCostNaira", "profitMarginPct"],
    };
    const ok = await trigger(fieldsToValidate[step]);
    if (ok) {
      if (step === 1) void loadMaterials();
      setStep((s) => s + 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: data.customerId,
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
        toast.error(result.error ?? "Failed to create project");
        return;
      }
      toast.success("Project created!");
      router.push(`/projects/${result.data.id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Project</h1>
        <p className="mt-1 text-sm text-slate-500">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
      </div>

      {/* Progress */}
      <div
        className="flex items-center gap-1"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
      >
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < step ? "bg-inox-600 text-white" : i === step ? "bg-inox-100 text-inox-700 border-inox-600 border-2" : "bg-slate-100 text-slate-400"}`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < step ? "bg-inox-600" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
      >
        {/* STEP 1: Customer */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-search">Search customer</Label>
                <Input
                  id="cust-search"
                  placeholder="Type name, phone, or email…"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    void searchCustomers(e.target.value);
                  }}
                />
              </div>
              {customers.length > 0 && (
                <div className="max-h-40 divide-y overflow-y-auto rounded-md border">
                  {customers.map((c) => (
                    <div
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      className="hover:bg-inox-50 hover:text-inox-700 w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setValue("customerId", c.id);
                          setSelectedCustomerName(c.name);
                          setCustomers([]);
                          setCustomerSearch("");
                        }
                      }}
                      onClick={() => {
                        setValue("customerId", c.id);
                        setSelectedCustomerName(c.name);
                        setCustomers([]);
                        setCustomerSearch("");
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
              {customerId && (
                <p className="text-inox-700 text-sm font-medium">
                  ✓ Selected: {selectedCustomerName}
                </p>
              )}
              {errors.customerId && (
                <p className="text-xs text-red-500">{errors.customerId.message}</p>
              )}

              <Separator />
              <p className="text-sm font-medium text-slate-700">Or create a new customer</p>
              <div className="space-y-2">
                <Input
                  placeholder="Full name *"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                />
                <Input
                  placeholder="Phone (optional)"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!newCustomerName || creatingCustomer}
                  onClick={() => {
                    void createCustomer();
                  }}
                >
                  {creatingCustomer ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create & select
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Project Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Project type *</Label>
                <Input
                  {...register("projectType")}
                  placeholder="e.g. Kitchen Sink, Security Door"
                />
                {errors.projectType && (
                  <p className="text-xs text-red-500">{errors.projectType.message}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(["dimensionL", "dimensionW", "dimensionH"] as const).map((d, i) => (
                  <div key={d} className="space-y-1.5">
                    <Label>{["Length", "Width", "Height"][i]} (mm)</Label>
                    <Input type="number" {...register(d)} />
                    {errors[d] && <p className="text-xs text-red-500">{errors[d]?.message}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label>Complexity</Label>
                <Select
                  defaultValue="standard"
                  onValueChange={(v) => {
                    if (v) setValue("complexity", v as FormData["complexity"]);
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
                <Textarea {...register("notes")} rows={3} placeholder="Any special requirements…" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Materials */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, idx) => {
                const mat = allMaterials.find((m) => m.id === watchedMaterials[idx]?.materialId);
                const lineTotal = mat
                  ? (mat.pricePerUnitKobo / 100) * (watchedMaterials[idx]?.quantity ?? 0)
                  : 0;
                return (
                  <div key={field.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label>Material</Label>
                      <Select
                        value={watchedMaterials[idx]?.materialId}
                        onValueChange={(v) => {
                          if (v) setValue(`materials.${idx}.materialId`, v);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {allMaterials.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.unitType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label>Qty</Label>
                      <Input type="number" {...register(`materials.${idx}.quantity`)} min={1} />
                    </div>
                    <div className="w-32 pb-2 text-right font-mono text-sm text-slate-600">
                      {formatNaira(lineTotal)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(idx)}
                      className="pb-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ materialId: "", quantity: 1 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
              {errors.materials && (
                <p className="text-xs text-red-500">
                  {errors.materials.message ?? "Check material rows"}
                </p>
              )}
              <div className="text-right font-semibold text-slate-800">
                Materials subtotal: {formatNaira(materialCostNaira)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Costs */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Labour cost (₦)</Label>
                  <Input type="number" {...register("labourCostNaira")} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label>Transport cost (₦)</Label>
                  <Input type="number" {...register("transportCostNaira")} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label>Profit margin: {profitPct}%</Label>
                  <input
                    type="range"
                    {...register("profitMarginPct")}
                    min={0}
                    max={40}
                    step={1}
                    className="accent-inox-600 w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-inox-50 border-inox-200">
              <CardHeader>
                <CardTitle className="text-inox-700">Live Cost Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ["Materials", formatNaira(materialCostNaira)],
                  ["Labour", formatNaira(Number(labourNaira))],
                  ["Transport", formatNaira(Number(transportNaira))],
                  [`Complexity (${complexity})`, `×${COMPLEXITY_MULTIPLIERS[complexity]}`],
                  [`Profit (${profitPct}%)`, formatNaira(profit)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-slate-600">
                    <span>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
                <Separator />
                <div className="text-inox-800 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 5: Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Confirm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-slate-500">Customer</div>
                <div className="font-medium">{selectedCustomerName}</div>
                <div className="text-slate-500">Project type</div>
                <div className="font-medium">{projectType}</div>
                <div className="text-slate-500">Complexity</div>
                <div className="font-medium capitalize">{complexity}</div>
                <div className="text-slate-500">Dimensions</div>
                <div className="font-medium">
                  {dimensionL} × {dimensionW} × {dimensionH} mm
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="font-medium text-slate-700">Materials ({fields.length} lines)</p>
                {watchedMaterials.map((line, i) => {
                  const mat = allMaterials.find((m) => m.id === line.materialId);
                  return mat ? (
                    <div key={i} className="flex justify-between text-slate-600">
                      <span>
                        {mat.name} × {line.quantity}
                      </span>
                      <span className="font-mono">
                        {formatNaira((mat.pricePerUnitKobo / 100) * line.quantity)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <Separator />
              <div className="space-y-1">
                {[
                  ["Materials", formatNaira(materialCostNaira)],
                  ["Labour", formatNaira(Number(labourNaira))],
                  ["Transport", formatNaira(Number(transportNaira))],
                  [`Profit (${profitPct}%)`, formatNaira(profit)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-slate-600">
                    <span>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
                <div className="text-inox-800 flex justify-between pt-2 text-xl font-bold">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                void goNext();
              }}
              className="bg-inox-600 hover:bg-inox-700 text-white"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-inox-600 hover:bg-inox-700 text-white"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Project
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

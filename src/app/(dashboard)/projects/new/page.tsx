"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronRight, ChevronLeft, Check, Calculator, Building2, Ruler, Cog, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";

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

const STEPS = [
  { id: "customer", title: "Customer", icon: Building2 },
  { id: "details", title: "Details", icon: Ruler },
  { id: "materials", title: "Materials", icon: Hammer },
  { id: "costs", title: "Costs", icon: Calculator },
];

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

  const materialCostNaira = watchedMaterials.reduce((sum: number, line: any) => {
    const mat = allMaterials.find((m: any) => m.id === line.materialId);
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
    setCustomers(data.data?.items ?? []);
  };

  const loadMaterials = async () => {
    if (allMaterials.length > 0) return;
    const res = await fetch("/api/materials");
    const data = await res.json();
    setAllMaterials(data.data ?? []);
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
    
    // For the final step, just submit
    if (step === STEPS.length - 1) {
      void handleSubmit(onSubmit)();
      return;
    }
    
    const ok = await trigger(fieldsToValidate[step]);
    if (ok) {
      if (step === 0) void loadMaterials();
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
          materials: data.materials.map((m: any) => ({
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
      toast.success("Project created successfully!");
      router.push(`/projects/${result.data.id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-full min-h-[calc(100vh-8rem)]">
      {/* ── Left Column: Form ────────────────────────────────────────────── */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Project</h1>
          <p className="mt-2 text-muted-foreground">Follow the steps below to set up a new project and generate its initial quotation.</p>
        </div>

        {/* Progress Steps */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 bg-muted/50 rounded-full" />
          <div className="relative flex justify-between">
            {STEPS.map((s: any, i: number) => {
              const Icon = s.icon;
              const isCompleted = i < step;
              const isActive = i === step;
              return (
                <div key={s.id} className="flex flex-col items-center gap-3 bg-neutral-50 dark:bg-neutral-950 px-2 relative z-10">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500",
                      isCompleted 
                        ? "border-inox-600 bg-inox-600 text-white shadow-inox shadow-inox-500/20" 
                        : isActive 
                        ? "border-inox-600 bg-background text-inox-600 shadow-sm" 
                        : "border-muted bg-muted/20 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hidden sm:block",
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="h-full flex flex-col"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1"
              >
                {/* STEP 1: Customer */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">Select Customer</h2>
                      <p className="text-sm text-muted-foreground">Search for an existing customer or create a new one.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-search">Search customer</Label>
                        <div className="relative">
                          <Input
                            id="cust-search"
                            placeholder="Type name, phone, or email…"
                            className="bg-white dark:bg-neutral-900"
                            value={customerSearch}
                            onChange={(e) => {
                              setCustomerSearch(e.target.value);
                              void searchCustomers(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      
                      {customers.length > 0 && (
                        <Card className="max-h-40 overflow-y-auto border-border shadow-sm">
                          <div className="divide-y divide-border">
                            {customers.map((c: any) => (
                              <div
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                className="w-full cursor-pointer px-4 py-3 text-left text-sm transition-colors hover:bg-inox-50 dark:hover:bg-inox-950/30 hover:text-inox-600"
                                onClick={() => {
                                  setValue("customerId", c.id);
                                  setSelectedCustomerName(c.name);
                                  setCustomers([]);
                                  setCustomerSearch("");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    setValue("customerId", c.id);
                                    setSelectedCustomerName(c.name);
                                    setCustomers([]);
                                    setCustomerSearch("");
                                  }
                                }}
                              >
                                <span className="font-medium">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {customerId && (
                        <div className="rounded-lg border border-inox-200 bg-inox-50/50 dark:bg-inox-950/20 dark:border-inox-900 px-4 py-3 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-inox-100 dark:bg-inox-900 flex items-center justify-center text-inox-600">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Selected Customer</p>
                            <p className="text-sm font-semibold text-foreground">{selectedCustomerName}</p>
                          </div>
                        </div>
                      )}
                      
                      {errors.customerId && (
                        <p className="text-sm text-destructive font-medium">{errors.customerId.message}</p>
                      )}

                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-neutral-50 dark:bg-neutral-950 px-2 text-muted-foreground font-semibold">Or create new</span>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Full name *</Label>
                          <Input
                            placeholder="John Doe"
                            className="bg-white dark:bg-neutral-900"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Phone (optional)</Label>
                          <Input
                            placeholder="+234..."
                            className="bg-white dark:bg-neutral-900"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={!newCustomerName || creatingCustomer}
                        onClick={() => void createCustomer()}
                      >
                        {creatingCustomer ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create & Select Customer
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Project Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">Project Details</h2>
                      <p className="text-sm text-muted-foreground">Specify the dimensions and complexity of the project.</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-1.5">
                        <Label>Project type *</Label>
                        <Input
                          {...register("projectType")}
                          placeholder="e.g. Stainless Steel Kitchen Sink"
                          className="bg-white dark:bg-neutral-900 text-lg py-6"
                        />
                        {errors.projectType && (
                          <p className="text-xs text-destructive">{errors.projectType.message}</p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        {(["dimensionL", "dimensionW", "dimensionH"] as const).map((d, i) => (
                          <div key={d} className="space-y-1.5">
                            <Label>{["Length", "Width", "Height"][i]} (mm)</Label>
                            <Input type="number" {...register(d)} className="bg-white dark:bg-neutral-900" />
                            {errors[d] && <p className="text-xs text-destructive">{(errors[d] as any)?.message}</p>}
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
                          <SelectTrigger className="bg-white dark:bg-neutral-900">
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
                        <Label>Notes & Special Requirements</Label>
                        <Textarea 
                          {...register("notes")} 
                          rows={4} 
                          className="bg-white dark:bg-neutral-900 resize-none"
                          placeholder="Any specific design requirements, delivery details, or client preferences..." 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Materials */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Materials Required</h2>
                        <p className="text-sm text-muted-foreground">List all raw materials needed for fabrication.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ materialId: "", quantity: 1 })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field: any, idx: number) => {
                        const mat = allMaterials.find((m) => m.id === watchedMaterials[idx]?.materialId);
                        const lineTotal = mat
                          ? (mat.pricePerUnitKobo / 100) * (watchedMaterials[idx]?.quantity ?? 0)
                          : 0;
                        
                        return (
                          <div key={field.id} className="flex items-end gap-3 p-3 sm:p-4 rounded-xl border border-border bg-white dark:bg-neutral-900 shadow-sm transition-all hover:border-inox-200">
                            <div className="flex-1 space-y-1.5">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Material</Label>
                              <Select
                                value={watchedMaterials[idx]?.materialId || ""}
                                onValueChange={(v) => {
                                  if (v) setValue(`materials.${idx}.materialId`, v);
                                }}
                              >
                                <SelectTrigger className="w-full border-0 shadow-none bg-muted/30 hover:bg-muted/50 focus:ring-0">
                                  <SelectValue placeholder="Select material…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allMaterials.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      <div className="flex flex-col py-0.5">
                                        <span className="font-medium">{m.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                          {formatNaira(m.pricePerUnitKobo / 100)} / {m.unitType}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="w-20 sm:w-24 space-y-1.5">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Qty</Label>
                              <Input 
                                type="number" 
                                {...register(`materials.${idx}.quantity`)} 
                                min={1} 
                                className="border-0 shadow-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-0 text-center"
                              />
                            </div>
                            
                            <div className="w-24 sm:w-32 pb-2.5 text-right font-mono text-sm font-medium">
                              {formatNaira(lineTotal)}
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(idx)}
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                      
                      {errors.materials && (
                        <p className="text-sm text-destructive font-medium px-2 mt-2">
                          {errors.materials.message ?? "Please add at least one material"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Costs */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">Costs & Margins</h2>
                      <p className="text-sm text-muted-foreground">Set your operational costs and desired profit margin.</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-4 p-5 rounded-xl border border-border bg-white dark:bg-neutral-900 shadow-sm">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">Labour Cost (₦)</Label>
                          <p className="text-xs text-muted-foreground mb-2">Estimated cost for fabrication and assembly.</p>
                          <Input 
                            type="number" 
                            {...register("labourCostNaira")} 
                            min={0} 
                            className="text-lg py-6 max-w-sm font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4 p-5 rounded-xl border border-border bg-white dark:bg-neutral-900 shadow-sm">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">Transport Cost (₦)</Label>
                          <p className="text-xs text-muted-foreground mb-2">Estimated cost for delivery and installation.</p>
                          <Input 
                            type="number" 
                            {...register("transportCostNaira")} 
                            min={0} 
                            className="text-lg py-6 max-w-sm font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4 p-5 rounded-xl border border-border bg-white dark:bg-neutral-900 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-semibold">Profit Margin</Label>
                          <span className="inline-flex items-center justify-center rounded-full bg-inox-100 dark:bg-inox-900/50 px-3 py-1 text-sm font-bold text-inox-700 dark:text-inox-400">
                            {profitPct}%
                          </span>
                        </div>
                        <input
                          type="range"
                          {...register("profitMarginPct")}
                          min={0}
                          max={40}
                          step={1}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-inox-600"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                          <span>0%</span>
                          <span>20%</span>
                          <span>40%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-auto pt-8 flex items-center justify-between border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0 || submitting}
                className="w-32"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button
                type="button"
                size="lg"
                onClick={() => void goNext()}
                disabled={submitting}
                className="w-40 bg-inox-600 hover:bg-inox-700 text-white shadow-inox transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : step === STEPS.length - 1 ? (
                  <>Create Project <Check className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Next Step <ChevronRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right Column: Live Summary ─────────────────────────────────────── */}
      <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
        <div className="sticky top-6">
          <Card className="border-border shadow-card-lg overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl">
            <div className="h-2 w-full bg-inox-gradient" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-inox-600" />
                Live Cost Preview
              </CardTitle>
              <CardDescription>Real-time calculation based on your inputs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Context Summary */}
              {(selectedCustomerName || projectType) && (
                <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
                  {selectedCustomerName && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Customer</p>
                      <p className="text-sm font-medium">{selectedCustomerName}</p>
                    </div>
                  )}
                  {projectType && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Project</p>
                      <p className="text-sm font-medium">{projectType}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cost Breakdown</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Materials
                    </span>
                    <span className="font-mono font-medium text-foreground">{formatNaira(materialCostNaira)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Labour
                    </span>
                    <span className="font-mono font-medium text-foreground">{formatNaira(Number(labourNaira))}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Transport
                    </span>
                    <span className="font-mono font-medium text-foreground">{formatNaira(Number(transportNaira))}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Adjustments */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Adjustments</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Complexity ({complexity})</span>
                    <span className="font-mono font-medium text-foreground">× {COMPLEXITY_MULTIPLIERS[complexity]}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">Profit Margin <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{profitPct}%</span></span>
                    <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">+{formatNaira(profit)}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-dashed border-border mt-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Quotation</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{formatNaira(total)}</p>
                  </div>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

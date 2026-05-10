"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils/cn";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  unitType: z.enum(["piece", "metre", "kilogram", "litre", "sqmetre"] as const),
  pricePerUnitKobo: z.coerce.number().int().positive("Price must be positive"),
});
type FormData = z.infer<typeof schema>;

type Material = {
  id: string;
  name: string;
  unitType: string;
  pricePerUnitKobo: number;
  updatedAt: Date;
  updatedBy: { name: string | null } | null;
};

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

function MaterialForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues ?? {},
  });

  return (
    <form
      onSubmit={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void handleSubmit(onSubmit as any)(e);
      }}
      className="space-y-4 pt-2"
    >
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input {...register("name")} placeholder="304 Stainless Sheet" className="transition-shadow focus:shadow-glow" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Unit Type</Label>
        <Select
          defaultValue={defaultValues?.unitType}
          onValueChange={(v) => {
            if (v) setValue("unitType", v as FormData["unitType"]);
          }}
        >
          <SelectTrigger className="transition-shadow focus:shadow-glow">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {["piece", "metre", "kilogram", "litre", "sqmetre"].map((u) => (
              <SelectItem key={u} value={u} className="capitalize">
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.unitType && <p className="text-xs text-destructive">{errors.unitType.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Price per unit (₦)</Label>
        <Input type="number" {...register("pricePerUnitKobo")} placeholder="5000" className="transition-shadow focus:shadow-glow" />
        {errors.pricePerUnitKobo && (
          <p className="text-xs text-destructive">{errors.pricePerUnitKobo.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="bg-inox-600 text-white shadow-inox hover:bg-inox-700 transition-all duration-200 active:scale-[0.98] w-full"
        disabled={loading}
      >
        {loading && <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
        Save Material
      </Button>
    </form>
  );
}

export function MaterialsManager({ initialMaterials }: { initialMaterials: Material[] }) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [addOpen, setAddOpen] = useState(false);
  const [editMat, setEditMat] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pricePerUnitKobo: data.pricePerUnitKobo * 100 }),
      });
      if (!res.ok) {
        toast.error("Failed to create material");
        return;
      }
      toast.success("Material created");
      setAddOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: FormData) => {
    if (!editMat) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/materials/${editMat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pricePerUnitKobo: data.pricePerUnitKobo * 100 }),
      });
      if (!res.ok) {
        toast.error("Failed to update material");
        return;
      }
      toast.success("Material updated");
      setEditMat(null);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete material");
        return;
      }
      toast.success("Material deleted");
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button className="bg-inox-600 text-white shadow-inox hover:bg-inox-700 transition-all duration-200 active:scale-[0.98]">
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Material</DialogTitle>
            </DialogHeader>
            <MaterialForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={materials}
        emptyMessage="No materials yet. Create one to get started."
        columns={[
          {
            key: "name",
            header: "Material",
            cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
          },
          {
            key: "unit",
            header: "Unit Type",
            cell: (row) => {
              const dotColor =
                row.unitType === "kilogram"
                  ? "bg-blue-400"
                  : row.unitType === "metre"
                  ? "bg-purple-400"
                  : "bg-amber-400";
              return (
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                  <span className="capitalize text-muted-foreground">
                    {row.unitType}
                  </span>
                </div>
              );
            },
          },
          {
            key: "price",
            header: "Price/unit",
            className: "text-right",
            cell: (row) => (
              <span className="font-mono font-semibold text-foreground">
                {formatNaira(row.pricePerUnitKobo)}
              </span>
            ),
          },
          {
            key: "updated",
            header: "Updated",
            className: "hidden md:table-cell",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {new Date(row.updatedAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ),
          },
          {
            key: "by",
            header: "By",
            className: "hidden lg:table-cell",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.updatedBy?.name ?? "Unknown"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (row) => (
              <div className="flex justify-end gap-1">
                <Dialog
                  open={editMat?.id === row.id}
                  onOpenChange={(o) => setEditMat(o ? row : null)}
                >
                  <DialogTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Material</DialogTitle>
                    </DialogHeader>
                    <MaterialForm
                      defaultValues={{
                        name: row.name,
                        unitType: row.unitType as FormData["unitType"],
                        pricePerUnitKobo: row.pricePerUnitKobo / 100,
                      }}
                      onSubmit={handleEdit}
                      loading={loading}
                    />
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete material?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will soft-delete "{row.name}". This action can be reversed by an admin.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          void handleDelete(row.id);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit as any)(e);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input {...register("name")} placeholder="304 Stainless Sheet" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Unit Type</Label>
        <Select
          defaultValue={defaultValues?.unitType}
          onValueChange={(v) => {
            if (v) setValue("unitType", v);
          }}
        >
          <SelectTrigger>
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
        {errors.unitType && <p className="text-xs text-red-500">{errors.unitType.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Price per unit (₦)</Label>
        <Input type="number" {...register("pricePerUnitKobo")} placeholder="5000" />
        {errors.pricePerUnitKobo && (
          <p className="text-xs text-red-500">{errors.pricePerUnitKobo.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="bg-inox-600 hover:bg-inox-700 w-full text-white"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          <DialogTrigger render={<Button className="bg-inox-600 hover:bg-inox-700 text-white" />}>
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Material</DialogTitle>
            </DialogHeader>
            <MaterialForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Price/Unit</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    No materials yet.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-slate-600 capitalize">{m.unitType}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNaira(m.pricePerUnitKobo)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(m.updatedAt).toLocaleDateString("en-NG")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog
                          open={editMat?.id === m.id}
                          onOpenChange={(o) => setEditMat(o ? m : null)}
                        >
                          <DialogTrigger render={<Button variant="ghost" size="sm" />}>
                            <Pencil className="h-4 w-4" />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Material</DialogTitle>
                            </DialogHeader>
                            <MaterialForm
                              defaultValues={{
                                name: m.name,
                                unitType: m.unitType as FormData["unitType"],
                                pricePerUnitKobo: m.pricePerUnitKobo / 100,
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
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                              />
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete material?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will soft-delete &quot;{m.name}&quot;. This action can be
                                reversed by an admin.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  void handleDelete(m.id);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

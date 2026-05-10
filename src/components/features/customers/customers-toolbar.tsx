"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const newCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
});
type NewCustomerInput = z.infer<typeof newCustomerSchema>;

export function CustomersToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewCustomerInput>({
    resolver: zodResolver(newCustomerSchema),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/customers?${params.toString()}`);
  };

  const onSubmit = async (data: NewCustomerInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to create customer");
      } else {
        toast.success("Customer created successfully");
        reset();
        setDialogOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearch} className="flex min-w-60 flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button className="bg-inox-600 hover:bg-inox-700 text-white" />}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="mt-2 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Name *</Label>
              <Input id="cust-name" {...register("name")} placeholder="Alhaji Musa" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Phone</Label>
              <Input id="cust-phone" {...register("phone")} placeholder="+234 800 000 0000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-email">Email</Label>
              <Input
                id="cust-email"
                type="email"
                {...register("email")}
                placeholder="customer@example.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-address">Address</Label>
              <Textarea
                id="cust-address"
                {...register("address")}
                rows={2}
                placeholder="Lagos, Nigeria"
              />
            </div>
            <Button
              type="submit"
              className="bg-inox-600 hover:bg-inox-700 w-full text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Customer
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

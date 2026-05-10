"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
}

export function CustomerEditForm({ customer }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to update customer");
      } else {
        toast.success("Customer updated");
        router.refresh();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Name *</Label>
        <Input id="edit-name" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-phone">Phone</Label>
        <Input id="edit-phone" {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-email">Email</Label>
        <Input id="edit-email" type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-address">Address</Label>
        <Textarea id="edit-address" {...register("address")} rows={2} />
      </div>
      <Button
        type="submit"
        size="sm"
        className="bg-inox-600 hover:bg-inox-700 text-white"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

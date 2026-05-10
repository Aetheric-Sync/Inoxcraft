"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2, UserX, Shield } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

const newUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Minimum 8 characters"),
  role: z.enum(["admin", "staff"] as const),
});
type NewUserData = z.infer<typeof newUserSchema>;

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
};

export function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NewUserData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(newUserSchema) as any,
    defaultValues: { role: "staff" },
  });

  const handleCreate = async (data: NewUserData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to create user");
        return;
      }
      toast.success("Staff account created");
      reset();
      setAddOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        toast.error("Failed to change role");
        return;
      }
      toast.success("Role updated");
      router.refresh();
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to deactivate user");
        return;
      }
      toast.success("User deactivated");
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
            Add Staff
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Staff Account</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                void handleSubmit(handleCreate)(e);
              }}
              className="mt-2 space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input {...register("name")} placeholder="Aminu Bello" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...register("email")} placeholder="staff@inoxcraft.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" {...register("password")} placeholder="min 8 characters" />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  defaultValue="staff"
                  onValueChange={(v) => {
                    if (v) setValue("role", v as NewUserData["role"]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="bg-inox-600 hover:bg-inox-700 w-full text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-slate-500">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-inox-100 text-inox-700 hover:bg-inox-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("en-NG")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {user.id !== currentUserId && (
                        <>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(v) => {
                              if (v) void handleRoleChange(user.id, v);
                            }}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <Shield className="mr-1 h-3 w-3" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
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
                              <UserX className="h-4 w-4" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will deactivate {user.name ?? user.email}&apos;s account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    void handleDeactivate(user.id);
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {user.id === currentUserId && (
                        <span className="px-2 py-1 text-xs text-slate-400">You</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

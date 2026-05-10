"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Layers, Eye, EyeOff, ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/lib/validators/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

const features = [
  { icon: "⚡", label: "Instant cost calculations" },
  { icon: "📄", label: "Professional PDF quotations" },
  { icon: "📊", label: "Business analytics dashboard" },
  { icon: "📧", label: "Email quotations to clients" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading   ] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (branding) ──────────────── */}
      <div className="relative hidden w-[45%] flex-col overflow-hidden bg-neutral-950 lg:flex">
        {/* background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-inox-900/60 via-transparent to-neutral-950/80" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-inox-gradient shadow-inox">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-white">
                HAKEEM'S INOXCRAFT
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
                Fabrication Suite
              </p>
            </div>
          </div>

          {/* centre copy */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold leading-tight text-white">
                Run your fabrication
                <br />
                <span className="gradient-text">business smarter.</span>
              </h1>
              <p className="mt-3 text-base leading-relaxed text-neutral-400">
                Generate professional quotations, track projects, and grow your
                stainless steel fabrication business — all in one place.
              </p>
            </motion.div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {f.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* footer */}
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} HAKEEM'S INOXCRAFT. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <motion.div
          className="w-full max-w-[380px] space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-inox-gradient">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold">INOXCRAFT</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your INOXCRAFT account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn(
                    "h-10 pl-9 transition-shadow focus:shadow-glow",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    "h-10 pl-9 pr-10 transition-shadow focus:shadow-glow",
                    errors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* submit */}
            <Button
              type="submit"
              className={cn(
                "group h-10 w-full bg-inox-600 text-white shadow-inox",
                "hover:bg-inox-700 hover:shadow-inox/60",
                "transition-all duration-200"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

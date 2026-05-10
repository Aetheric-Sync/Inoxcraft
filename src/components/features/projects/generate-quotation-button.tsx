"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  projectId: string;
}

export function GenerateQuotationButton({ projectId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to generate quotation");
      } else {
        toast.success("Quotation generated successfully");
        router.refresh();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={() => {
        void handleGenerate();
      }}
      disabled={loading}
      size="sm"
      className="bg-inox-600 hover:bg-inox-700 text-white"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      Generate Quotation
    </Button>
  );
}

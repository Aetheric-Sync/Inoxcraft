"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDown, Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  quotationId: string;
  pdfUrl: string | null;
  emailedAt: string | null;
}

export function QuotationActions({ quotationId, pdfUrl, emailedAt }: Props) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [alreadySent, setAlreadySent] = useState(!!emailedAt);

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/email`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to send email");
      } else {
        toast.success("Quotation sent by email");
        setAlreadySent(true);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {pdfUrl && (
        <Button
          render={
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          }
          variant="outline"
          size="sm"
        />
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={sendingEmail || alreadySent}
        onClick={() => {
          void handleSendEmail();
        }}
      >
        {sendingEmail ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        {alreadySent ? "Email Sent" : "Send by Email"}
      </Button>
    </div>
  );
}

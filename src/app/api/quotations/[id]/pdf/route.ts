import { type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import { withAuth } from "@/lib/api-guard";
import { quotationRepository } from "@/repositories/quotation.repository";
import { QuotationPDF } from "@/components/features/quotations/quotation-pdf";
import { notFound, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  return withAuth(req, async () => {
    try {
      const quotation = await quotationRepository.findById(id);
      if (!quotation) return notFound("Quotation not found");

      // Cast to DocumentProps equivalent to satisfy react-pdf renderer while maintaining data integrity
      const pdfElement = React.createElement(QuotationPDF, {
        quotation: quotation as unknown as QuotationWithFullDetails,
      });
      const buffer = await renderToBuffer(pdfElement as React.ReactElement);

      return new Response(buffer as Uint8Array, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${quotation.reference}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (e) {
      console.error("PDF generation error:", e);
      return serverError(e);
    }
  });
}

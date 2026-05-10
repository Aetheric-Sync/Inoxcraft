import { type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import { withAuth } from "@/lib/api-guard";
import { quotationRepository } from "@/repositories/quotation.repository";
import { sendQuotationEmail } from "@/services/email.service";
import { QuotationPDF } from "@/components/features/quotations/quotation-pdf";
import { ok, badRequest, notFound, serverError } from "@/lib/api-response";
import { formatNaira } from "@/lib/utils/money";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  return withAuth(req, async () => {
    try {
      const quotation = await quotationRepository.findById(id);
      if (!quotation) return notFound("Quotation not found");

      if (!quotation.project.customer.email) {
        return badRequest(
          "Customer does not have an email address. Update the customer record first.",
        );
      }

      const pdfElement = React.createElement(QuotationPDF, {
        quotation: quotation as unknown as QuotationWithFullDetails,
      });
      const pdfBuffer = await renderToBuffer(pdfElement as React.ReactElement);

      await sendQuotationEmail({
        to: quotation.project.customer.email,
        customerName: quotation.project.customer.name,
        reference: quotation.reference,
        totalAmountFormatted: formatNaira(quotation.totalAmountKobo),
        validUntil: new Date(quotation.validUntil).toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        pdfBuffer: Buffer.from(pdfBuffer as Uint8Array),
      });

      await quotationRepository.markEmailed(quotation.id);

      return ok({ message: "Quotation emailed successfully" });
    } catch (e) {
      console.error("Email API error:", e);
      if (e instanceof Error) return badRequest(e.message);
      return serverError(e);
    }
  });
}

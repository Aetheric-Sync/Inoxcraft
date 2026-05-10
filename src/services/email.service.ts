import { Resend } from "resend";

import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export interface SendQuotationEmailOptions {
  to: string;
  customerName: string;
  reference: string;
  totalAmountFormatted: string;
  validUntil: string;
  pdfBuffer: Buffer;
}

export async function sendQuotationEmail(opts: SendQuotationEmailOptions): Promise<void> {
  const { error } = await resend.emails.send({
    from: "HAKEEM'S INOXCRAFT <quotations@inoxcraft.com>",
    to: opts.to,
    subject: `Quotation ${opts.reference} from HAKEEM'S INOXCRAFT`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="background:#156648;padding:24px 32px">
          <h1 style="color:white;margin:0;font-size:20px">HAKEEM'S INOXCRAFT</h1>
          <p style="color:#a0d4bc;margin:4px 0 0;font-size:13px">Professional Stainless Steel Fabrication</p>
        </div>
        <div style="padding:32px">
          <p>Dear ${opts.customerName},</p>
          <p>Thank you for choosing HAKEEM'S INOXCRAFT. Please find your quotation attached.</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:24px 0">
            <p style="margin:0 0 4px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px">Quotation reference</p>
            <p style="margin:0;font-size:20px;font-weight:bold;color:#156648">${opts.reference}</p>
            <p style="margin:8px 0 0;font-size:14px">Total: <strong>${opts.totalAmountFormatted}</strong></p>
            <p style="margin:4px 0 0;font-size:12px;color:#666">Valid until: ${opts.validUntil}</p>
          </div>
          <p>If you have any questions, please contact us.</p>
          <p style="margin-top:32px;color:#666;font-size:12px">
            HAKEEM'S INOXCRAFT — Professional Stainless Steel & Iron Fabrication
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${opts.reference}.pdf`,
        content: opts.pdfBuffer,
      },
    ],
  });

  if (error) {
    console.error("Email error:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

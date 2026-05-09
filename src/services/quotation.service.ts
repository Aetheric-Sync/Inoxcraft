import { quotationRepository } from "@/repositories/quotation.repository";
import { projectRepository } from "@/repositories/project.repository";

export async function generateQuotationReference(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await quotationRepository.getLastReferenceNumber();
  const next = String(last + 1).padStart(4, "0");
  return `INX-${year}-${next}`;
}

export async function createQuotation(
  projectId: string,
  createdById: string,
): Promise<{ id: string; reference: string }> {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new Error("Project not found");

  const reference = await generateQuotationReference();

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const quotation = await quotationRepository.create({
    projectId,
    createdById,
    reference,
    totalAmountKobo: project.totalCostKobo,
    validUntil,
  });

  await projectRepository.updateStatus(projectId, "quoted");

  return { id: quotation.id, reference: quotation.reference };
}

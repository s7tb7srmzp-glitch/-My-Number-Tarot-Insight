"use client";

import type { AllCardsResult } from "@/lib/numerology";
import type { IntakeInput, NarrativeSection } from "@/lib/types";

export async function downloadReportPdf(
  input: IntakeInput,
  cards: AllCardsResult,
  sections: NarrativeSection[],
  closing: string
) {
  const [{ pdf }, { default: ReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/ReportDocument"),
  ]);

  const { default: React } = await import("react");
  const element = React.createElement(ReportDocument, {
    input,
    cards,
    sections,
    closing,
  }) as Parameters<typeof pdf>[0];

  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const nameForFile = input.name?.trim() ? input.name.trim() : "상담리포트";

  const a = document.createElement("a");
  a.href = url;
  a.download = `${nameForFile}_수비학타로상담리포트.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

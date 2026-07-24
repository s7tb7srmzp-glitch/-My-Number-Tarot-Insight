"use client";

import { useState } from "react";
import IntakeForm from "@/components/IntakeForm";
import ResultView from "@/components/ResultView";
import ApiKeySettings from "@/components/ApiKeySettings";
import AppHeader from "@/components/AppHeader";
import { getInterpretation } from "@/lib/interpretClient";
import type { AllCardsResult } from "@/lib/numerology";
import type { IntakeInput, NarrativeSection } from "@/lib/types";

type Stage =
  | { step: "intake" }
  | { step: "loading"; input: IntakeInput }
  | {
      step: "result";
      input: IntakeInput;
      cards: AllCardsResult;
      sections: NarrativeSection[];
      closing: string;
      usedAI: boolean;
      aiFailureReason?: string;
    }
  | { step: "error"; input: IntakeInput; message: string };

export default function Home() {
  const [stage, setStage] = useState<Stage>({ step: "intake" });
  const [generatingReport, setGeneratingReport] = useState(false);

  async function handleIntakeSubmit(input: IntakeInput) {
    setStage({ step: "loading", input });
    try {
      const data = await getInterpretation(input);
      setStage({
        step: "result",
        input,
        cards: data.cards,
        sections: data.sections,
        closing: data.closing,
        usedAI: data.usedAI,
        aiFailureReason: data.aiFailureReason,
      });
    } catch (e) {
      setStage({
        step: "error",
        input,
        message: e instanceof Error ? e.message : "알 수 없는 오류가 발생했어요.",
      });
    }
  }

  async function handleGenerateReport() {
    if (stage.step !== "result") return;
    setGeneratingReport(true);
    try {
      const { downloadReportPdf } = await import("@/lib/generateReportPdf");
      await downloadReportPdf(stage.input, stage.cards, stage.sections, stage.closing);
    } catch (e) {
      console.error(e);
      alert("PDF 리포트를 만드는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setGeneratingReport(false);
    }
  }

  function handleReset() {
    setStage({ step: "intake" });
  }

  return (
    <>
      <AppHeader onHome={handleReset} showHome={stage.step !== "intake"} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
        {stage.step === "intake" && (
          <div className="flex w-full flex-col items-center gap-4">
            <IntakeForm onSubmit={handleIntakeSubmit} submitting={false} />
            <ApiKeySettings />
          </div>
        )}

        {stage.step === "loading" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-300 border-t-rose-500" />
            <p className="text-sm text-ink-soft">
              카드를 계산하고, 삶의 흐름을 이야기로 엮고 있어요...
            </p>
          </div>
        )}

        {stage.step === "error" && (
          <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-rose-200 bg-white/70 p-8 text-center shadow-sm">
            <p className="text-sm text-rose-600">{stage.message}</p>
            <button
              onClick={() => handleIntakeSubmit(stage.input)}
              className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
            >
              다시 시도하기
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-ink-soft underline underline-offset-2"
            >
              처음부터 다시 입력하기
            </button>
          </div>
        )}

        {stage.step === "result" && (
          <ResultView
            input={stage.input}
            cards={stage.cards}
            sections={stage.sections}
            closing={stage.closing}
            usedAI={stage.usedAI}
            aiFailureReason={stage.aiFailureReason}
            onGenerateReport={handleGenerateReport}
            generatingReport={generatingReport}
            onReset={handleReset}
          />
        )}
      </main>
    </>
  );
}

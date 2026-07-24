import CardBadge from "./CardBadge";
import type { AllCardsResult } from "@/lib/numerology";
import type { IntakeInput, NarrativeSection } from "@/lib/types";

type Props = {
  input: IntakeInput;
  cards: AllCardsResult;
  sections: NarrativeSection[];
  closing: string;
  usedAI: boolean;
  onGenerateReport: () => void;
  generatingReport: boolean;
  onReset: () => void;
};

export default function ResultView({
  input,
  cards,
  sections,
  closing,
  usedAI,
  onGenerateReport,
  generatingReport,
  onReset,
}: Props) {
  const nameLabel = input.name?.trim() ? `${input.name.trim()}님` : "내담자님";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 px-4 pb-16">
      <div className="text-center">
        <p className="text-sm tracking-widest text-rose-500">상담 리포트</p>
        <h1 className="mt-1 text-2xl font-medium text-ink sm:text-3xl">
          {nameLabel}의 다섯 카드
        </h1>
        {!usedAI && (
          <p className="mt-2 text-xs text-ink-soft">
            (AI 연동 키가 설정되지 않아 기본 서사로 보여드리고 있어요.)
          </p>
        )}
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible">
        <CardBadge roleLabel="성격카드" cardId={cards.personality} highlight />
        <CardBadge roleLabel="영혼카드" cardId={cards.soul} highlight />
        <CardBadge roleLabel="작년카드" cardId={cards.lastYear} />
        <CardBadge roleLabel="올해카드" cardId={cards.thisYear} highlight />
        <CardBadge roleLabel="내년카드" cardId={cards.nextYear} />
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        {sections.map((section, i) => (
          <section key={i} className="flex flex-col gap-2">
            <h2 className="text-lg font-medium text-rose-600">
              {section.heading}
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {section.body}
            </p>
          </section>
        ))}

        <div className="mt-2 border-t border-rose-100 pt-4">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft italic">
            {closing}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onGenerateReport}
          disabled={generatingReport}
          className="w-full rounded-full bg-rose-500 px-6 py-3 text-sm font-medium tracking-wide text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {generatingReport ? "리포트를 만들고 있어요..." : "상담 리포트 생성 (PDF)"}
        </button>
        <button
          onClick={onReset}
          className="w-full rounded-full border border-rose-300 px-6 py-3 text-sm font-medium tracking-wide text-rose-600 transition hover:bg-rose-50 sm:w-auto"
        >
          새 상담 시작하기
        </button>
      </div>
    </div>
  );
}

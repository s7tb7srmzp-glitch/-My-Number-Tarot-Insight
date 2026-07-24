import CardBadge from "./CardBadge";
import { groupSections } from "@/lib/sectionGrouping";
import type { AllCardsResult } from "@/lib/numerology";
import type { IntakeInput, NarrativeSection } from "@/lib/types";

type Props = {
  input: IntakeInput;
  cards: AllCardsResult;
  sections: NarrativeSection[];
  closing: string;
  usedAI: boolean;
  aiFailureReason?: string;
  onGenerateReport: () => void;
  generatingReport: boolean;
  onReset: () => void;
};

function SectionBlock({ section }: { section: NarrativeSection }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-base font-medium text-rose-600">{section.heading}</h3>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
        {section.body}
      </p>
    </section>
  );
}

export default function ResultView({
  input,
  cards,
  sections,
  closing,
  usedAI,
  aiFailureReason,
  onGenerateReport,
  generatingReport,
  onReset,
}: Props) {
  const nameLabel = input.name?.trim() ? `${input.name.trim()}님` : "내담자님";

  const {
    core: coreSections,
    flow: flowSections,
    question: questionSections,
    other: otherSections,
  } = groupSections(sections, input.questions);

  let statusNote: string | null = null;
  if (!usedAI) {
    statusNote = aiFailureReason
      ? `AI 호출에 실패해 기본 서사로 보여드리고 있어요. (${aiFailureReason})`
      : "AI 연동 키가 설정되지 않아 기본 서사로 보여드리고 있어요.";
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 px-4 pb-16">
      <div className="text-center">
        <p className="text-sm tracking-widest text-rose-500">상담 리포트</p>
        <h1 className="mt-1 text-2xl font-medium text-ink sm:text-3xl">
          {nameLabel}의 이야기
        </h1>
        {statusNote && <p className="mt-2 text-xs text-ink-soft">{statusNote}</p>}
      </div>

      {/* 그룹 1: 타고난 나 (성격 + 영혼) */}
      <div className="flex flex-col gap-5 rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <h2 className="text-center text-lg font-medium text-ink">
          타고난 나 — 성격과 영혼
        </h2>
        <div className="flex justify-center gap-5">
          <CardBadge roleLabel="성격카드" cardId={cards.personality} highlight size="lg" />
          <CardBadge roleLabel="영혼카드" cardId={cards.soul} highlight size="lg" />
        </div>
        <div className="flex flex-col gap-6 border-t border-rose-100 pt-5">
          {coreSections.map((s, i) => (
            <SectionBlock key={i} section={s} />
          ))}
        </div>
      </div>

      {/* 그룹 2: 3년의 흐름 스프레드 (작년 - 올해 - 내년) */}
      <div className="flex flex-col gap-5 rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <h2 className="text-center text-lg font-medium text-ink">
          3년의 흐름 — 작년 · 올해 · 내년
        </h2>
        <p className="text-center text-xs text-ink-soft">
          이 세 장은 1월~12월 달력이 아니라 {nameLabel}의 생일({input.birth.month}월{" "}
          {input.birth.day}일)을 기준으로 나뉘어요. 생일부터 다음 생일 전날까지가 한 해로
          이어집니다.
        </p>
        <div className="flex items-end justify-center gap-3 py-2 sm:gap-5">
          <CardBadge
            roleLabel="작년카드"
            cardId={cards.lastYear}
            wrapperClassName="-rotate-6 translate-y-2"
          />
          <CardBadge
            roleLabel="올해카드"
            cardId={cards.thisYear}
            highlight
            size="lg"
            wrapperClassName="z-10"
          />
          <CardBadge
            roleLabel="내년카드"
            cardId={cards.nextYear}
            wrapperClassName="rotate-6 translate-y-2"
          />
        </div>
        <div className="flex flex-col gap-6 border-t border-rose-100 pt-5">
          {flowSections.map((s, i) => (
            <SectionBlock key={i} section={s} />
          ))}
        </div>
      </div>

      {/* 그룹 3: 질문에 대한 답 */}
      {questionSections.length > 0 && (
        <div className="flex flex-col gap-6 rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <h2 className="text-center text-lg font-medium text-ink">
            궁금하셨던 점에 대한 답
          </h2>
          {questionSections.map((s, i) => (
            <SectionBlock key={i} section={s} />
          ))}
        </div>
      )}

      {otherSections.length > 0 && (
        <div className="flex flex-col gap-6 rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          {otherSections.map((s, i) => (
            <SectionBlock key={i} section={s} />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft italic">
          {closing}
        </p>
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

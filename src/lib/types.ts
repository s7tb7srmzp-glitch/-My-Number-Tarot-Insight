import type { BirthDate } from "./numerology";

export type IntakeInput = {
  name: string;
  birth: BirthDate;
  /** 상담 기준일 (년도카드 anchor 계산에 사용) */
  consultDate: string; // YYYY-MM-DD
  /** 내담자가 궁금해하는 점, 최대 3개(선택) */
  questions: string[];
};

/**
 * core: 성격/영혼(타고난 나) 설명
 * flow: 작년→올해→내년 흐름/스프레드 설명
 * question: 내담자 질문 하나에 대한 답변 (질문 1개당 섹션 1개)
 */
export type NarrativeGroup = "core" | "flow" | "question";

export type NarrativeSection = {
  heading: string;
  body: string;
  group: NarrativeGroup;
};

export type InterpretResponse = {
  sections: NarrativeSection[];
  closing: string;
  usedAI: boolean;
  /** AI 키가 있었지만 실제 호출이 실패해 폴백으로 대체된 경우의 사유 (사용자에게 정확히 안내하기 위함) */
  aiFailureReason?: string;
};

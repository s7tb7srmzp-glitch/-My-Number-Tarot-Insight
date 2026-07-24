import type { BirthDate } from "./numerology";

export type IntakeInput = {
  name: string;
  birth: BirthDate;
  /** 상담 기준일 (년도카드 anchor 계산에 사용) */
  consultDate: string; // YYYY-MM-DD
  /** 내담자가 궁금해하는 점, 최대 3개(선택) */
  questions: string[];
};

export type NarrativeSection = {
  heading: string;
  body: string;
};

export type InterpretResponse = {
  sections: NarrativeSection[];
  closing: string;
  usedAI: boolean;
};

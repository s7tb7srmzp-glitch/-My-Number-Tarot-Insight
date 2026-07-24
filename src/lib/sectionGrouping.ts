import type { NarrativeSection } from "./types";

export type GroupedSections = {
  core: NarrativeSection[];
  flow: NarrativeSection[];
  question: NarrativeSection[];
  /** group 태그가 core/flow/question 중 아무것도 아닌, 정말 예외적인 경우의 안전망 */
  other: NarrativeSection[];
};

function normalizeTokens(text: string): string[] {
  return text
    .replace(/[?？!！.,、·"'“”‘’()[\]{}]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

/** 섹션 소제목이 실제 질문 문장과 얼마나 겹치는 단어를 담고 있는지(가장 잘 맞는 질문 기준) */
function bestQuestionOverlap(heading: string, questions: string[]): number {
  const headingTokens = new Set(normalizeTokens(heading));
  let best = 0;
  for (const q of questions) {
    const qTokens = normalizeTokens(q);
    if (qTokens.length === 0) continue;
    const overlap = qTokens.filter((t) => headingTokens.has(t)).length;
    if (overlap > best) best = overlap;
  }
  return best;
}

/**
 * AI가 항상 group 태그를 완벽하게 붙여준다는 보장이 없다 (예: 성격카드=영혼카드로
 * 같은 카드가 나오면 "설명할 게 없다"고 판단해 core 섹션을 통째로 빼먹거나,
 * 질문에 대한 답을 flow로 잘못 태그하는 경우가 실제로 있었다). 화면/PDF에 빈
 * 공백이나 잘못된 배치가 생기지 않도록, 받은 섹션을 최대한 의도한 구조에
 * 맞게 보정한다.
 *
 * questions는 내담자가 실제로 입력한 질문 원문이다. 잘못 태그된 질문 답변을
 * 찾아낼 때 "배열 끝에서 몇 개"처럼 위치만 믿지 않고, 소제목이 실제 질문과
 * 단어를 얼마나 공유하는지를 우선 근거로 삼는다 (AI가 flow와 question 섹션을
 * 순서대로 안 쓰고 섞어 쓰는 경우, 위치 기반 추정은 엉뚱한 flow 섹션을 끌고
 * 오면서 정작 진짜 질문 답변은 그대로 flow에 남겨두는 문제가 있었다).
 */
export function groupSections(
  sections: NarrativeSection[],
  questions: string[]
): GroupedSections {
  const questionCount = questions.length;

  let core = sections.filter((s) => s.group === "core");
  let flow = sections.filter((s) => s.group === "flow");
  let question = sections.filter((s) => s.group === "question");
  let other = sections.filter(
    (s) => s.group !== "core" && s.group !== "flow" && s.group !== "question"
  );

  // core 섹션이 없으면(성격=영혼 카드가 같아 AI가 생략한 경우 등), 화면에
  // 빈 공백을 남기지 않도록 다른 섹션에서 하나를 끌어와 core로 승격시킨다.
  if (core.length === 0) {
    if (flow.length > 0) {
      core = [flow[0]];
      flow = flow.slice(1);
    } else if (other.length > 0) {
      core = [other[0]];
      other = other.slice(1);
    } else if (question.length > 0) {
      core = [question[0]];
      question = question.slice(1);
    }
  } else if (core.length > 1) {
    // core는 항상 1개만 노출한다. 나머지는 flow 앞쪽으로 되돌린다.
    flow = [...core.slice(1), ...flow];
    core = core.slice(0, 1);
  }

  // 질문 답변이 flow/other에 잘못 섞여 들어간 경우, 부족한 개수만큼 찾아온다.
  if (question.length < questionCount && questionCount > 0) {
    let need = questionCount - question.length;

    // 1순위: 소제목이 실제 질문과 단어를 공유하는 섹션을 점수순으로 끌어온다
    // (순서에 상관없이 내용으로 판단하므로, flow/question이 뒤섞여 있어도 잡아낸다).
    const candidates = [
      ...flow.map((s, i) => ({ s, i, from: "flow" as const })),
      ...other.map((s, i) => ({ s, i, from: "other" as const })),
    ]
      .map((c) => ({ ...c, score: bestQuestionOverlap(c.s.heading, questions) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    const picked = candidates.slice(0, need);
    const pickedFlow = new Set(picked.filter((c) => c.from === "flow").map((c) => c.s));
    const pickedOther = new Set(picked.filter((c) => c.from === "other").map((c) => c.s));

    if (pickedFlow.size > 0) flow = flow.filter((s) => !pickedFlow.has(s));
    if (pickedOther.size > 0) other = other.filter((s) => !pickedOther.has(s));
    question = [...question, ...picked.map((c) => c.s)];
    need -= picked.length;

    // 2순위(안전망): 내용 기반으로 못 찾은 나머지는 flow 뒤쪽에서 채운다.
    if (need > 0) {
      const pulled = flow.splice(Math.max(flow.length - need, 0), need);
      question = [...question, ...pulled];
    }
  }

  return { core, flow, question, other };
}

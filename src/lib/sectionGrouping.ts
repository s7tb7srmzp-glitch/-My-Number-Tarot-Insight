import type { NarrativeSection } from "./types";

export type GroupedSections = {
  core: NarrativeSection[];
  flow: NarrativeSection[];
  question: NarrativeSection[];
  /** group 태그가 core/flow/question 중 아무것도 아닌, 정말 예외적인 경우의 안전망 */
  other: NarrativeSection[];
};

/**
 * AI가 항상 group 태그를 완벽하게 붙여준다는 보장이 없다 (예: 성격카드=영혼카드로
 * 같은 카드가 나오면 "설명할 게 없다"고 판단해 core 섹션을 통째로 빼먹거나,
 * 질문에 대한 답을 flow로 잘못 태그하는 경우가 실제로 있었다). 화면/PDF에 빈
 * 공백이나 잘못된 배치가 생기지 않도록, 받은 섹션을 최대한 의도한 구조에
 * 맞게 보정한다.
 */
export function groupSections(
  sections: NarrativeSection[],
  questionCount: number
): GroupedSections {
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

  // 질문 답변이 flow/other에 잘못 섞여 들어간 경우, 부족한 개수만큼
  // flow의 뒤쪽(질문 답변이 이어 붙는 경향이 있는 위치)에서 끌어온다.
  if (question.length < questionCount) {
    const need = questionCount - question.length;
    const pulled = flow.splice(Math.max(flow.length - need, 0), need);
    question = [...question, ...pulled];
  }

  return { core, flow, question, other };
}

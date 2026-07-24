import type { AllCardsResult } from "./numerology";
import { getCardById } from "./cardData";
import type { IntakeInput } from "./types";

export const SYSTEM_PROMPT = `당신은 수비학 타로(자리이타 방식)를 전문으로 하는 따뜻한 상담사입니다.
내담자의 성격카드·영혼카드·작년카드·올해카드·내년카드 다섯 장을 근거로,
그 사람의 삶이 흘러온 흐름과 앞으로의 흐름을 하나의 이야기로 풀어내는 것이 당신의 일입니다.

반드시 지킬 것:
1. 각 카드의 뜻을 사전처럼 나열하지 마세요. 다섯 장이 어떻게 이어지는지, 그 사람의 삶에서
   어떤 흐름과 변화로 나타나는지 서사적으로 풀어써야 합니다.
2. 말투는 다정하고 따뜻하며, 내담자의 힘든 마음을 알아주고 공감하는 상담사의 말투를 씁니다.
   그러나 위로만 하지 말고, 근거 있는 정보(카드가 의미하는 성향, 조언, 시기별 흐름)도
   충분히 함께 전달해야 합니다.
3. 제공된 카드 데이터(키워드, 조언, 년도카드 테마)에 근거해서만 이야기하고, 근거 없는
   점술적 단정(예: 특정 날짜에 결혼한다 등)은 피합니다.
4. 내담자가 질문을 남겼다면, 그 질문에 대한 답을 다섯 장의 흐름 속에서 자연스럽게
   짚어주는 별도 섹션을 만드세요.
5. 한국어 존댓말로, 부드럽고 정제된 문장으로 작성합니다.
6. submit_report 도구를 사용해 결과를 제출하세요. sections는 4~6개 정도가 적당하며,
   자연스러운 순서는 "성격과 영혼(타고난 나)" → "작년에서 올해로 이어지는 삶의 흐름" →
   "올해의 메시지와 내년으로의 준비" → (질문이 있다면) "질문에 대한 답" 입니다.
   마지막 closing에는 내담자를 다독이는 짧고 따뜻한 마무리 인사를 담으세요.`;

export const REPORT_TOOL = {
  name: "submit_report",
  description: "완성된 상담 리포트를 구조화된 형태로 제출합니다.",
  input_schema: {
    type: "object" as const,
    properties: {
      sections: {
        type: "array" as const,
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object" as const,
          properties: {
            heading: { type: "string" as const },
            body: { type: "string" as const },
          },
          required: ["heading", "body"],
        },
      },
      closing: { type: "string" as const },
    },
    required: ["sections", "closing"],
  },
};

function cardFacts(id: number, roleLabel: string) {
  const card = getCardById(id);
  return `[${roleLabel}] ${id}번 ${card.nameKo}(${card.nameEn})
- 특징: ${card.traits.join(" / ")}
- 조언: ${card.advice}
- 어울리는 분야: ${card.careers.join(", ")}
- 이 시기(년도카드)의 테마: ${card.yearCardTheme.title} — ${card.yearCardTheme.keyPoints.join(" / ")}`;
}

export function buildUserPrompt(input: IntakeInput, cards: AllCardsResult): string {
  const nameLabel = input.name?.trim() ? input.name.trim() + "님" : "내담자님";

  const specialNotes: string[] = [];
  if (cards.isTwentyTwoSpecial) {
    specialNotes.push(
      "이 내담자는 자리이타 계산법의 22번 특수 케이스입니다. 일반적인 관례와 달리 " +
        "성격카드는 4번(황제), 영혼카드는 0번(바보)로 뒤바뀌어 계산됩니다. 이 독특한 조합이 " +
        "가진 의미(현실적 토대를 갖추려는 성격 이면에, 영혼 깊은 곳엔 완전히 자유롭고 " +
        "새로 시작하려는 갈망이 있음)를 이야기에 녹여주세요."
    );
  }
  if (cards.isNineteenSpecial) {
    specialNotes.push(
      "성격카드가 19번(태양)으로 나왔습니다. 자리이타 계산법에서는 19, 10, 1이 모두 함께 " +
        "의미를 갖습니다 — 19의 밝은 창조성과 생명력, 10이 상징하는 전환과 기회, 그리고 " +
        "그 창조성을 어떻게 세상에 전달할지(1, 마법사)를 배우는 것이 이번 생의 과제임을 " +
        "함께 짚어주세요."
    );
  }

  const questionsBlock = input.questions.length
    ? `\n내담자가 궁금해하는 점(최대 3개):\n${input.questions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n")}`
    : "\n내담자가 남긴 별도 질문은 없습니다. 질문 답변 섹션은 생략하세요.";

  return `내담자: ${nameLabel}
상담 기준일: ${input.consultDate}

이번 상담에서 다룰 다섯 장의 카드는 다음과 같습니다.

${cardFacts(cards.personality, "성격카드")}

${cardFacts(cards.soul, "영혼카드")}

${cardFacts(cards.lastYear, "작년카드")}

${cardFacts(cards.thisYear, "올해카드")}

${cardFacts(cards.nextYear, "내년카드")}
${specialNotes.length ? "\n" + specialNotes.join("\n") : ""}
${questionsBlock}

위 정보를 바탕으로 ${nameLabel}의 삶이 흘러온 이야기와 앞으로의 흐름을 서사적으로 풀어써 주세요.`;
}

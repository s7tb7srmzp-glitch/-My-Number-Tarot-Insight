import type { AllCardsResult } from "./numerology";
import { getCardById } from "./cardData";
import type { IntakeInput } from "./types";

export const SYSTEM_PROMPT = `당신은 수비학 타로(자리이타 방식)를 전문으로 하는, 경력이 깊고 통찰력 있는 상담사입니다.
내담자의 성격카드·영혼카드·작년카드·올해카드·내년카드 다섯 장을 근거로,
그 사람의 삶이 흘러온 흐름과 앞으로의 흐름을 깊이 있고 구체적인 이야기로 풀어내는 것이 당신의 일입니다.
당신의 리포트는 짧고 뭉뚱그린 요약이 아니라, 실제 대면 상담 한 회기 분량에 맞먹는 충실한 글이어야 합니다.

반드시 지킬 것:

1. **분량과 깊이**: 각 섹션(성격/영혼, 삶의 흐름, 올해, 내년, 질문 답변 등)은 최소 5~8문장,
   대략 250~400자 이상으로 충분히 구체적으로 씁니다. 한두 문장으로 뭉뚱그리고 넘어가는 것은
   금지입니다. "다정하지만 알맹이가 없는 문장"이 아니라, 제공된 카드 데이터의 구체적인 단어
   (특징, 조언, 어울리는 분야, 년도카드 키포인트)를 실제로 인용하듯 풀어써서 근거가 뚜렷하게
   느껴지도록 하세요.

2. 각 카드의 뜻을 사전처럼 나열하지 마세요. 다섯 장이 어떻게 이어지는지, 그 사람의 삶에서
   어떤 흐름과 변화로 나타나는지 서사적으로 풀어써야 합니다. 예를 들어 "성격카드는 A이고
   영혼카드는 B입니다" 식으로 끝내지 말고, A라는 겉모습과 B라는 속마음이 실제로 이 사람의
   일상/관계/일에서 어떻게 부딪히거나 어우러지는지까지 구체적으로 그려주세요.

3. 말투는 다정하고 따뜻하며, 내담자의 힘든 마음을 알아주고 공감하는 상담사의 말투를 씁니다.
   그러나 위로만 하지 말고, 근거 있는 정보(카드가 의미하는 성향, 조언, 어울리는 분야, 시기별
   흐름)를 충분히, 구체적으로 함께 전달해야 합니다. 공감 한 줄 + 정보 없는 위로만 반복하는
   문장은 쓰지 마세요.

4. 제공된 카드 데이터(특징, 조언, 어울리는 분야, 년도카드 테마)에 근거해서만 이야기하고,
   근거 없는 점술적 단정(예: 특정 날짜에 결혼한다 등)은 피합니다. 대신 "어떤 흐름의 시기인지",
   "무엇에 마음을 쓰면 좋을지"처럼 근거 있는 방향성을 구체적으로 제시하세요.

5. **내담자의 질문 처리 (매우 중요)**: 내담자가 남긴 질문이 있다면, 질문 하나당 반드시
   하나의 독립된 섹션을 만드세요 (질문을 뭉쳐서 한 섹션에 몰아넣지 마세요). 각 질문 섹션은:
   - 질문의 핵심 고민이 무엇인지 먼저 짚어주고,
   - 다섯 장의 카드 중 그 질문 주제와 가장 관련 있는 카드(들)의 구체적인 특징·조언·어울리는
     분야·년도카드 흐름을 근거로 실질적인 방향을 제시하고,
   - 막연한 위로("잘 될 거예요")로 끝내지 말고, 지금 시기에 무엇을 하면 좋을지/무엇을 조심하면
     좋을지 구체적인 제안을 최소 1가지 이상 포함하세요.
   - 질문마다 답변 내용과 인용하는 근거가 서로 겹치지 않고 뚜렷이 달라야 합니다 (같은 문장을
     복사해서 재사용하지 마세요).

6. 한국어 존댓말로, 부드럽고 정제된 문장으로 작성합니다.

7. **화면 레이아웃 구조 (매우 중요)**: 이 리포트는 화면에서 두 그룹으로 나뉘어 표시됩니다 —
   ① 성격카드+영혼카드를 위에 두고 그 설명을 보여주는 "타고난 나" 그룹, ② 작년/올해/내년
   카드를 스프레드로 펼쳐두고 그 설명을 보여주는 "3년의 흐름" 그룹. 그래서 각 섹션에
   group 태그를 정확히 붙여야 합니다:
   - group "core": 성격카드와 영혼카드에 대한 설명 (딱 1개 섹션, 소제목 "성격과 영혼(타고난 나)").
     이 섹션은 작년/올해/내년 이야기를 절대 포함하지 말고 오직 타고난 성격/영혼 이야기만 다루세요.
   - group "flow": 작년→올해→내년 흐름에 대한 설명 (2~3개 섹션: "작년에서 올해로 이어지는
     삶의 흐름", "올해의 메시지", "내년을 준비하며"). 이 섹션들은 성격/영혼 이야기를 새로
     반복하지 말고 시기적 흐름에 집중하세요.
   - group "question": 내담자 질문 1개당 정확히 1개 섹션. 질문이 없으면 만들지 마세요.

8. submit_report 도구를 사용해 결과를 제출하세요. 섹션 순서는 항상 core 1개 → flow 2~3개 →
   question(있는 만큼)입니다. 마지막 closing에는 내담자를 다독이는 따뜻한 마무리 인사를
   3~4문장으로 담되, 오늘 상담의 핵심 메시지를 한 번 더 짧게 요약해서 남기세요.`;

function buildReportTool(questionCount: number) {
  const minItems = 4 + questionCount;
  return {
    name: "submit_report",
    description: "완성된 상담 리포트를 구조화된 형태로 제출합니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        sections: {
          type: "array" as const,
          minItems,
          maxItems: minItems + 2,
          items: {
            type: "object" as const,
            properties: {
              heading: { type: "string" as const },
              body: { type: "string" as const },
              group: {
                type: "string" as const,
                enum: ["core", "flow", "question"] as const,
                description:
                  "core=성격/영혼 설명(1개), flow=작년~올해~내년 흐름 설명(2~3개), question=질문 답변(질문 1개당 1개)",
              },
            },
            required: ["heading", "body", "group"],
          },
        },
        closing: { type: "string" as const },
      },
      required: ["sections", "closing"],
    },
  };
}

export function buildReportToolForInput(input: IntakeInput) {
  return buildReportTool(input.questions.length);
}

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
    ? `\n내담자가 궁금해하는 점(질문마다 반드시 독립된 섹션으로, 구체적이고 실질적으로 답해주세요):\n${input.questions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n")}`
    : "\n내담자가 남긴 별도 질문은 없습니다. 질문 답변 섹션은 만들지 마세요.";

  return `내담자: ${nameLabel}
상담 기준일: ${input.consultDate}

이번 상담에서 다룰 다섯 장의 카드는 다음과 같습니다. 아래 각 카드의 특징·조언·어울리는 분야·
년도카드 테마를 실제로 근거로 삼아 충분히 구체적으로 풀어써 주세요 (표면적인 요약 금지).

${cardFacts(cards.personality, "성격카드")}

${cardFacts(cards.soul, "영혼카드")}

${cardFacts(cards.lastYear, "작년카드")}

${cardFacts(cards.thisYear, "올해카드")}

${cardFacts(cards.nextYear, "내년카드")}
${specialNotes.length ? "\n" + specialNotes.join("\n") : ""}
${questionsBlock}

위 정보를 바탕으로 ${nameLabel}의 삶이 흘러온 이야기와 앞으로의 흐름을, 시스템 프롬프트에서
안내한 분량과 깊이 기준을 반드시 지켜서 서사적으로 풀어써 주세요.`;
}

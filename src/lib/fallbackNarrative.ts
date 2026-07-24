import type { AllCardsResult } from "./numerology";
import { getCardById } from "./cardData";
import type { IntakeInput, InterpretResponse } from "./types";

/**
 * AI API 키가 설정되지 않았을 때 사용하는 규칙 기반 서사 생성기.
 * AI만큼 매끄럽진 않지만, 카드 데이터를 조합해 다섯 장의 흐름을
 * 최소한의 문단으로라도 이어서 보여준다.
 */
export function buildFallbackNarrative(
  input: IntakeInput,
  cards: AllCardsResult
): InterpretResponse {
  const nameLabel = input.name?.trim() ? `${input.name.trim()}님` : "내담자님";
  const personality = getCardById(cards.personality);
  const soul = getCardById(cards.soul);
  const last = getCardById(cards.lastYear);
  const thisOne = getCardById(cards.thisYear);
  const next = getCardById(cards.nextYear);

  const sections = [
    {
      heading: "성격과 영혼, 타고난 나",
      body:
        `${nameLabel}의 성격카드는 ${cards.personality}번 ${personality.nameKo}, 영혼카드는 ${cards.soul}번 ${soul.nameKo}이에요. ` +
        `겉으로 드러나는 모습에는 ${personality.traits[0]} 같은 면이 있고, 그 안쪽 깊은 곳에는 ${soul.traits[0]} 같은 마음이 자리하고 있어요. ` +
        `${personality.advice} ${soul.advice}`,
    },
    {
      heading: "작년에서 올해로 이어지는 흐름",
      body:
        `작년은 ${cards.lastYear}번 ${last.nameKo}의 해였어요. ${last.yearCardTheme.title}이라는 주제 속에서 ${last.yearCardTheme.keyPoints[0]} 같은 흐름을 지나오셨을 거예요. ` +
        `그 흐름을 딛고 올해는 ${cards.thisYear}번 ${thisOne.nameKo}의 해로 들어섰습니다. ${thisOne.yearCardTheme.title}. ${thisOne.yearCardTheme.keyPoints.slice(0, 2).join(" ")}`,
    },
    {
      heading: "올해의 메시지와 내년으로의 준비",
      body:
        `${thisOne.advice} 그리고 다가올 내년은 ${cards.nextYear}번 ${next.nameKo}의 해로, ${next.yearCardTheme.title}. ${next.yearCardTheme.keyPoints[0]} 지금부터 천천히 마음을 준비해보셔도 좋겠어요.`,
    },
  ];

  if (input.questions.length) {
    sections.push({
      heading: "질문에 대한 답",
      body: input.questions
        .map(
          (q) =>
            `"${q}" — 지금의 ${cards.thisYear}번 ${thisOne.nameKo} 흐름과 ${cards.soul}번 ${soul.nameKo}이 말해주는 본연의 마음을 함께 떠올려보시면, 조금 더 선명한 답을 찾아가실 수 있을 거예요.`
        )
        .join(" "),
    });
  }

  return {
    sections,
    closing: `${nameLabel}, 지금까지 걸어오신 길도, 앞으로 걸어가실 길도 모두 ${nameLabel} 안의 힘으로 충분히 헤쳐나가실 수 있어요. 오늘의 이야기가 작은 위로와 힘이 되었길 바랍니다.`,
    usedAI: false,
  };
}

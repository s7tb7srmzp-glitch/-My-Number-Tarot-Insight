import type { AllCardsResult } from "./numerology";
import { getCardById, type CardEntry } from "./cardData";
import type { IntakeInput, InterpretResponse, NarrativeSection } from "./types";

/**
 * AI API 키가 없거나 AI 호출이 실패했을 때 쓰는 규칙 기반 서사 생성기.
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

  const sameCard = cards.personality === cards.soul;

  const coreBody = sameCard
    ? `${nameLabel}의 성격카드와 영혼카드는 모두 ${cards.personality}번 ${personality.nameKo}예요. ` +
      `겉으로 드러나는 모습과 마음 깊은 곳의 본성이 같은 카드로 나타났다는 건, 겉과 속이 다르지 않고 ` +
      `한결같은 사람이라는 뜻이기도 해요. ${personality.traits.slice(0, 3).join(", ")} 같은 면이 삶 전반에 ` +
      `걸쳐 뚜렷하게 드러날 거예요. 처음 만난 사람도, 오래 알고 지낸 사람도 ${nameLabel}에게서 비슷한 인상을 ` +
      `받는 편일 텐데, 그건 꾸며낸 모습과 실제 속마음 사이에 거리가 거의 없기 때문이에요. ${personality.advice} ` +
      `특히 ${personality.careers.slice(0, 3).join(", ")} 같은 분야에서 이 기질이 잘 발휘될 수 있어요. ` +
      `겉과 속이 같다는 건 스스로를 설명하기 쉽다는 장점이 있는 반면, 다른 모습을 시도해볼 여지가 좁게 ` +
      `느껴질 수도 있으니, 가끔은 이 틀 밖으로도 나를 확장해보는 시도가 좋은 자극이 될 수 있어요.`
    : `${nameLabel}의 성격카드는 ${cards.personality}번 ${personality.nameKo}, 영혼카드는 ${cards.soul}번 ${soul.nameKo}이에요. ` +
      `겉으로 드러나는 모습에는 ${personality.traits.slice(0, 2).join(", ")} 같은 면이 있고, 그 안쪽 깊은 곳에는 ` +
      `${soul.traits.slice(0, 2).join(", ")} 같은 마음이 자리하고 있어요. 사람들은 대개 ${personality.nameKo} ` +
      `카드가 보여주는 겉모습만으로 ${nameLabel}을 판단하기 쉽지만, 정작 스스로를 움직이는 동력은 훨씬 더 ` +
      `안쪽의 ${soul.nameKo} 카드다운 마음에서 나오는 경우가 많아요. 이 둘이 부딪힐 때도 있겠지만, ` +
      `${personality.careers.slice(0, 2).join(", ")} 같은 분야에서는 오히려 그 둘이 함께 힘을 발휘할 수 있어요. ` +
      `${personality.advice} 그리고 더 깊은 곳에서는, ${soul.advice} 겉모습과 속마음이 서로 다른 결을 가진 ` +
      `만큼, 둘 중 하나만 억누르기보다 상황에 따라 번갈아 꺼내 쓰는 유연함이 ${nameLabel}만의 강점이 될 수 있어요.`;

  const sections: NarrativeSection[] = [
    {
      heading: "성격과 영혼, 타고난 나",
      body: coreBody,
      group: "core",
    },
    {
      heading: "작년에서 올해로 이어지는 흐름",
      body:
        `작년은 ${cards.lastYear}번 ${last.nameKo}의 해였어요. ${last.yearCardTheme.title}이라는 주제 속에서 ` +
        `${last.yearCardTheme.keyPoints[0]} 같은 흐름을 지나오셨을 거예요. 그 흐름을 딛고 올해는 ${cards.thisYear}번 ` +
        `${thisOne.nameKo}의 해로 들어섰습니다. ${thisOne.yearCardTheme.title}. ${thisOne.yearCardTheme.keyPoints.slice(0, 2).join(" ")}`,
      group: "flow",
    },
    {
      heading: "올해의 메시지",
      body:
        `${thisOne.advice} ${thisOne.yearCardTheme.keyPoints.slice(2).join(" ")} 지금 이 시기를 어떻게 보내느냐에 따라 ` +
        `다음 흐름이 훨씬 수월해질 거예요.`,
      group: "flow",
    },
    {
      heading: "내년을 준비하며",
      body:
        `다가올 내년은 ${cards.nextYear}번 ${next.nameKo}의 해로, ${next.yearCardTheme.title}. ` +
        `${next.yearCardTheme.keyPoints.slice(0, 2).join(" ")} 지금부터 천천히 마음을 준비해보셔도 좋겠어요.`,
      group: "flow",
    },
  ];

  if (input.questions.length) {
    const lenses: CardEntry[] = [thisOne, soul, personality, next, last];
    input.questions.forEach((q, i) => {
      const lens = lenses[i % lenses.length];
      sections.push({
        heading: `질문 ${i + 1}에 대한 답: "${q}"`,
        body:
          `"${q}"라는 질문을 남겨주셨네요. 지금 ${nameLabel}의 흐름을 보면, ${lens.id}번 ${lens.nameKo}이 말해주는 ` +
          `"${lens.traits[0]}" 같은 면과 "${lens.yearCardTheme.title}"이라는 시기적 주제가 이 질문과 맞닿아 있어요. ` +
          `${lens.advice} 구체적으로는 ${lens.yearCardTheme.keyPoints[0]} 이 부분을 염두에 두시면 좋겠고, ` +
          `${lens.careers.length ? `${lens.careers[0]} 같은 방향으로 힘을 쏟아보시는 것도 도움이 될 수 있어요.` : "천천히 자신의 속도를 지켜보시면 좋겠어요."}`,
        group: "question",
      });
    });
  }

  return {
    sections,
    closing: `${nameLabel}, 지금까지 걸어오신 길도, 앞으로 걸어가실 길도 모두 ${nameLabel} 안의 힘으로 충분히 헤쳐나가실 수 있어요. 오늘의 이야기가 작은 위로와 힘이 되었길 바랍니다.`,
    usedAI: false,
  };
}

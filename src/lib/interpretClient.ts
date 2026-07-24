"use client";

import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { computeAllCards } from "@/lib/numerology";
import { SYSTEM_PROMPT, buildReportToolForInput, buildUserPrompt } from "@/lib/prompt";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import { getStoredApiKey } from "@/lib/apiKeyStore";
import type { IntakeInput, InterpretResponse, NarrativeSection } from "@/lib/types";
import type { AllCardsResult } from "@/lib/numerology";

const DEFAULT_MODEL = "claude-sonnet-5";

export type InterpretResult = InterpretResponse & { cards: AllCardsResult };

function describeError(error: unknown): string {
  if (error instanceof APIError) {
    if (error.status === 401) return "API 키가 올바르지 않은 것 같아요. 설정에서 키를 다시 확인해주세요.";
    if (error.status === 429) return "지금 요청이 많아 잠시 제한됐어요(요금/사용량 한도일 수 있어요).";
    if (error.status && error.status >= 500) return "Anthropic 서버에 일시적인 문제가 있는 것 같아요.";
    return `AI 호출 중 오류가 발생했어요 (${error.status ?? ""} ${error.message}).`;
  }
  if (error instanceof Error) {
    if (/network|fetch|failed to fetch/i.test(error.message)) {
      return "네트워크 연결 문제로 AI 호출에 실패했어요.";
    }
    return `AI 호출 중 오류가 발생했어요: ${error.message}`;
  }
  return "AI 호출 중 알 수 없는 오류가 발생했어요.";
}

/**
 * 정적 사이트(GitHub Pages)로 배포되므로 서버가 없다.
 * 사용자가 이 브라우저에 저장해둔 자신의 Anthropic API 키로 브라우저에서
 * 직접 API를 호출한다 (Anthropic SDK의 dangerouslyAllowBrowser 옵션 사용).
 * 키가 없거나 호출이 실패하면 규칙 기반 폴백 서사로 대체하되,
 * 실패 사유는 aiFailureReason으로 정확히 남긴다 (그래야 "키를 넣었는데 왜 기본
 * 서사가 나오지?" 같은 혼란을 없앨 수 있다).
 */
export async function getInterpretation(input: IntakeInput): Promise<InterpretResult> {
  const consultDate = input.consultDate ? new Date(input.consultDate) : new Date();
  const cards = computeAllCards(input.birth, consultDate);

  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return { cards, ...buildFallbackNarrative(input, cards) };
  }

  try {
    const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input, cards) }],
      tools: [buildReportToolForInput(input)],
      tool_choice: { type: "tool", name: "submit_report" },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      throw new Error("AI 응답에서 리포트를 찾을 수 없습니다.");
    }

    const parsed = toolUse.input as {
      sections: NarrativeSection[];
      closing: string;
    };

    return {
      cards,
      sections: parsed.sections,
      closing: parsed.closing,
      usedAI: true,
    };
  } catch (error) {
    console.error("AI 해석 생성 실패, 폴백 서사로 대체합니다:", error);
    const fallback = buildFallbackNarrative(input, cards);
    return { cards, ...fallback, aiFailureReason: describeError(error) };
  }
}

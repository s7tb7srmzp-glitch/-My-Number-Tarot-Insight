"use client";

import Anthropic from "@anthropic-ai/sdk";
import { computeAllCards } from "@/lib/numerology";
import { SYSTEM_PROMPT, REPORT_TOOL, buildUserPrompt } from "@/lib/prompt";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import { getStoredApiKey } from "@/lib/apiKeyStore";
import type { IntakeInput, InterpretResponse } from "@/lib/types";
import type { AllCardsResult } from "@/lib/numerology";

const DEFAULT_MODEL = "claude-sonnet-5";

export type InterpretResult = InterpretResponse & { cards: AllCardsResult };

/**
 * 정적 사이트(GitHub Pages)로 배포되므로 서버가 없다.
 * 사용자가 이 브라우저에 저장해둔 자신의 Anthropic API 키로 브라우저에서
 * 직접 API를 호출한다 (Anthropic SDK의 dangerouslyAllowBrowser 옵션 사용).
 * 키가 없거나 호출이 실패하면 규칙 기반 폴백 서사로 대체한다.
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
      max_tokens: 2200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input, cards) }],
      tools: [REPORT_TOOL],
      tool_choice: { type: "tool", name: "submit_report" },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      throw new Error("AI 응답에서 리포트를 찾을 수 없습니다.");
    }

    const parsed = toolUse.input as {
      sections: { heading: string; body: string }[];
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
    return { cards, ...buildFallbackNarrative(input, cards) };
  }
}

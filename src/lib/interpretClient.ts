"use client";

import Anthropic, { APIError, APIConnectionTimeoutError } from "@anthropic-ai/sdk";
import { computeAllCards } from "@/lib/numerology";
import { SYSTEM_PROMPT, buildReportToolForInput, buildUserPrompt } from "@/lib/prompt";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import { getStoredApiKey } from "@/lib/apiKeyStore";
import type { IntakeInput, InterpretResponse, NarrativeSection } from "@/lib/types";
import type { AllCardsResult } from "@/lib/numerology";

const DEFAULT_MODEL = "claude-sonnet-5";

export type InterpretResult = InterpretResponse & { cards: AllCardsResult };

const REQUEST_TIMEOUT_MS = 75_000;

// 질문이 2~3개면 요구되는 섹션 수가 6~7개(각 250~400자 이상)까지 늘어나
// 예전 4096으로는 JSON 응답이 다 끝나기 전에 잘리는 경우가 있었다.
const MAX_TOKENS = 8192;

class TruncatedResponseError extends Error {
  constructor() {
    super("AI 응답이 max_tokens 제한에 걸려 도중에 잘렸습니다.");
    this.name = "TruncatedResponseError";
  }
}

/**
 * group 태그(core/flow/question) 값 자체는 여기서 검증하지 않는다. Anthropic 툴 호출은
 * enum 제약을 100% 강제하지 않아서, 다른 내용은 멀쩡한데 섹션 하나의 group만 예상 밖의
 * 값으로 나오는 경우가 실제로 있었다. 그런 사소한 태그 오류 때문에 잘 만들어진 리포트
 * 전체를 버리고 기본 서사로 폴백하지 않도록, group 보정은 groupSections()에 맡기고
 * 여기서는 화면에 실제로 표시할 heading/body가 비어있지 않은지만 확인한다.
 */
function isValidReport(
  value: unknown
): value is { sections: NarrativeSection[]; closing: string } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.sections) || v.sections.length === 0) return false;
  if (typeof v.closing !== "string" || !v.closing.trim()) return false;
  return v.sections.every(
    (s) =>
      s &&
      typeof s === "object" &&
      typeof (s as NarrativeSection).heading === "string" &&
      (s as NarrativeSection).heading.trim() !== "" &&
      typeof (s as NarrativeSection).body === "string" &&
      (s as NarrativeSection).body.trim() !== ""
  );
}

function describeError(error: unknown): string {
  if (error instanceof TruncatedResponseError) {
    return "AI 응답이 너무 길어져서 도중에 잘렸어요. 질문 개수를 줄이거나 다시 시도해보세요.";
  }
  if (error instanceof APIConnectionTimeoutError) {
    return "AI 응답이 너무 오래 걸려서 기다림을 멈췄어요. 질문 개수를 줄이거나 다시 시도해보세요.";
  }
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

    const response = await anthropic.messages.create(
      {
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(input, cards) }],
        tools: [buildReportToolForInput(input)],
        tool_choice: { type: "tool", name: "submit_report" },
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );

    if (response.stop_reason === "max_tokens") {
      throw new TruncatedResponseError();
    }

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      throw new Error("AI 응답에서 리포트를 찾을 수 없습니다.");
    }

    if (!isValidReport(toolUse.input)) {
      throw new Error("AI 응답 형식이 예상과 달라요.");
    }
    const parsed = toolUse.input;

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

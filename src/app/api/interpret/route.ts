import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { computeAllCards } from "@/lib/numerology";
import { SYSTEM_PROMPT, REPORT_TOOL, buildUserPrompt } from "@/lib/prompt";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import type { IntakeInput, InterpretResponse } from "@/lib/types";

export const runtime = "nodejs";

type RawBody = {
  name?: unknown;
  birth?: { year?: unknown; month?: unknown; day?: unknown };
  consultDate?: unknown;
  questions?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parseIntField(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

export async function POST(request: Request) {
  let body: RawBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("잘못된 요청 형식입니다.");
  }

  const year = parseIntField(body.birth?.year, 1900, 2100);
  const month = parseIntField(body.birth?.month, 1, 12);
  const day = parseIntField(body.birth?.day, 1, 31);
  if (year === null || month === null || day === null) {
    return badRequest("생년월일을 올바르게 입력해주세요.");
  }

  const consultDateRaw = typeof body.consultDate === "string" ? body.consultDate : "";
  const consultDate = consultDateRaw ? new Date(consultDateRaw) : new Date();
  if (Number.isNaN(consultDate.getTime())) {
    return badRequest("상담 기준일이 올바르지 않습니다.");
  }

  const name = typeof body.name === "string" ? body.name.slice(0, 40) : "";

  const questions = Array.isArray(body.questions)
    ? body.questions
        .filter((q): q is string => typeof q === "string")
        .map((q) => q.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const input: IntakeInput = {
    name,
    birth: { year, month, day },
    consultDate: consultDateRaw || consultDate.toISOString().slice(0, 10),
    questions,
  };

  const cards = computeAllCards({ year, month, day }, consultDate);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackNarrative(input, cards);
    return NextResponse.json({ cards, ...fallback });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

    const response = await anthropic.messages.create({
      model,
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

    const result: InterpretResponse = {
      sections: parsed.sections,
      closing: parsed.closing,
      usedAI: true,
    };

    return NextResponse.json({ cards, ...result });
  } catch (error) {
    console.error("AI 해석 생성 실패, 폴백 서사로 대체합니다:", error);
    const fallback = buildFallbackNarrative(input, cards);
    return NextResponse.json({ cards, ...fallback });
  }
}

import { describe, expect, it } from "vitest";
import { groupSections } from "./sectionGrouping";
import type { NarrativeSection } from "./types";

function sec(heading: string, group: NarrativeSection["group"]): NarrativeSection {
  return { heading, body: `${heading} 본문`, group };
}

describe("groupSections", () => {
  it("passes through a well-tagged response unchanged", () => {
    const sections = [
      sec("성격과 영혼", "core"),
      sec("작년→올해", "flow"),
      sec("올해의 메시지", "flow"),
      sec("질문 1", "question"),
    ];
    const result = groupSections(sections, ["아무 질문"]);
    expect(result.core.map((s) => s.heading)).toEqual(["성격과 영혼"]);
    expect(result.flow.map((s) => s.heading)).toEqual(["작년→올해", "올해의 메시지"]);
    expect(result.question.map((s) => s.heading)).toEqual(["질문 1"]);
  });

  it("promotes the first flow section to core when core is missing (personality===soul case)", () => {
    const sections = [
      sec("작년→올해", "flow"),
      sec("올해의 메시지", "flow"),
      sec("내년을 준비하며", "flow"),
    ];
    const result = groupSections(sections, []);
    expect(result.core.map((s) => s.heading)).toEqual(["작년→올해"]);
    expect(result.flow.map((s) => s.heading)).toEqual(["올해의 메시지", "내년을 준비하며"]);
  });

  it("reclassifies a trailing mis-tagged flow section as a question answer", () => {
    const sections = [
      sec("성격과 영혼", "core"),
      sec("작년→올해", "flow"),
      sec("올해의 메시지", "flow"),
      sec("내년을 준비하며", "flow"),
      sec("올해 회사 생활, 어떻게 해야 할까요", "flow"), // 실제로는 질문 답변인데 flow로 잘못 태그된 경우
    ];
    const result = groupSections(sections, ["올해 회사 생활 어떻게 해야 할까요"]);
    expect(result.core.map((s) => s.heading)).toEqual(["성격과 영혼"]);
    expect(result.flow.map((s) => s.heading)).toEqual([
      "작년→올해",
      "올해의 메시지",
      "내년을 준비하며",
    ]);
    expect(result.question.map((s) => s.heading)).toEqual([
      "올해 회사 생활, 어떻게 해야 할까요",
    ]);
  });

  it("finds a mis-tagged question answer even when it's interleaved (not trailing) among flow sections", () => {
    // 실제로 관찰된 버그: AI가 질문 답변을 flow 섹션들 사이에 끼워 넣으면,
    // 배열 끝에서부터 개수만 세는 방식은 엉뚱한(진짜 flow인) 섹션을 question으로
    // 잘못 옮기고, 정작 진짜 질문 답변은 flow에 그대로 남겨둔다.
    const sections = [
      sec("성격과 영혼", "core"),
      sec("작년에서 올해로 이어지는 삶의 흐름", "flow"),
      sec("올해의 메시지", "flow"),
      sec("대학원 생활, 내년엔 어떻게 임하면 좋을까요", "flow"), // 실제로는 질문1 답변
      sec("내년을 준비하며", "flow"),
      sec("가족관계(남편, 아들)에서 주의할 점", "question"), // 질문2는 올바르게 태그됨
    ];
    const questions = [
      "내년에 대학원 생활을 어떻게 해야할까?",
      "가족관계(남편, 아들)에서 주의해야 할 점은?",
    ];
    const result = groupSections(sections, questions);

    expect(result.flow.map((s) => s.heading)).toEqual([
      "작년에서 올해로 이어지는 삶의 흐름",
      "올해의 메시지",
      "내년을 준비하며",
    ]);
    expect(result.question.map((s) => s.heading)).toEqual([
      "가족관계(남편, 아들)에서 주의할 점",
      "대학원 생활, 내년엔 어떻게 임하면 좋을까요",
    ]);
  });

  it("falls back to the very first section as core when nothing else is available", () => {
    const sections = [sec("유일한 섹션", "other" as NarrativeSection["group"])];
    const result = groupSections(sections, []);
    expect(result.core.map((s) => s.heading)).toEqual(["유일한 섹션"]);
    expect(result.other).toEqual([]);
  });

  it("collapses multiple core sections into one, pushing extras to flow", () => {
    const sections = [
      sec("성격과 영혼 A", "core"),
      sec("성격과 영혼 B", "core"),
      sec("작년→올해", "flow"),
    ];
    const result = groupSections(sections, []);
    expect(result.core.map((s) => s.heading)).toEqual(["성격과 영혼 A"]);
    expect(result.flow.map((s) => s.heading)).toEqual(["성격과 영혼 B", "작년→올해"]);
  });
});

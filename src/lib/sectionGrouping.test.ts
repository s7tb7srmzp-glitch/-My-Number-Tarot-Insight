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
    const result = groupSections(sections, 1);
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
    const result = groupSections(sections, 0);
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
    const result = groupSections(sections, 1);
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

  it("falls back to the very first section as core when nothing else is available", () => {
    const sections = [sec("유일한 섹션", "other" as NarrativeSection["group"])];
    const result = groupSections(sections, 0);
    expect(result.core.map((s) => s.heading)).toEqual(["유일한 섹션"]);
    expect(result.other).toEqual([]);
  });

  it("collapses multiple core sections into one, pushing extras to flow", () => {
    const sections = [
      sec("성격과 영혼 A", "core"),
      sec("성격과 영혼 B", "core"),
      sec("작년→올해", "flow"),
    ];
    const result = groupSections(sections, 0);
    expect(result.core.map((s) => s.heading)).toEqual(["성격과 영혼 A"]);
    expect(result.flow.map((s) => s.heading)).toEqual(["성격과 영혼 B", "작년→올해"]);
  });
});

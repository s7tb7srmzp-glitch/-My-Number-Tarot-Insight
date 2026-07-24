import { describe, expect, it } from "vitest";
import {
  digitSum,
  reduceToCardRange,
  getPersonalitySoul,
  getYearCardNumber,
  getPersonalYearAnchor,
  computeAllCards,
} from "./numerology";

describe("digitSum", () => {
  it("sums all digits", () => {
    expect(digitSum(2006)).toBe(8);
    expect(digitSum(1989)).toBe(27);
    expect(digitSum(21)).toBe(3);
  });
});

describe("reduceToCardRange", () => {
  it("keeps 0-21 as-is", () => {
    expect(reduceToCardRange(2000 + 1 + 5)).toBe(8); // 2006 -> 8
    expect(reduceToCardRange(1965 + 8 + 19)).toBe(21); // 1992 -> 21
    expect(reduceToCardRange(2000 + 5 + 24)).toBe(13); // 2029 -> 13
  });

  it("maps 22 to 0", () => {
    expect(reduceToCardRange(1965 + 8 + 20)).toBe(0); // 1993 -> 22 -> 0
  });

  it("re-reduces sums of 23 or more", () => {
    expect(reduceToCardRange(1954 + 8 + 27)).toBe(9); // 1989 -> 27 -> 9
  });

  it("matches the PDF year-card worked example (2026-04-23 -> 10)", () => {
    expect(reduceToCardRange(2026 + 4 + 23)).toBe(10); // 2053 -> 10
  });
});

describe("getPersonalitySoul", () => {
  it("2000-01-05: personality = soul = 8 (both single digit already)", () => {
    const r = getPersonalitySoul({ year: 2000, month: 1, day: 5 });
    expect(r.personality).toBe(8);
    expect(r.soul).toBe(8);
    expect(r.isTwentyTwoSpecial).toBe(false);
  });

  it("2000-05-24: personality = 13 (Death), soul reduces to 4 (Emperor)", () => {
    const r = getPersonalitySoul({ year: 2000, month: 5, day: 24 });
    expect(r.personality).toBe(13);
    expect(r.soul).toBe(4);
  });

  it("1965-08-19: personality = 21 (World), soul reduces to 3 (Empress)", () => {
    const r = getPersonalitySoul({ year: 1965, month: 8, day: 19 });
    expect(r.personality).toBe(21);
    expect(r.soul).toBe(3);
  });

  it("2005-07-07: soul converges to 3 regardless of grouping method", () => {
    const r = getPersonalitySoul({ year: 2005, month: 7, day: 7 });
    // raw 2019 -> digitSum 12 -> personality 12, soul 1+2=3
    expect(r.personality).toBe(12);
    expect(r.soul).toBe(3);
  });

  it("1954-08-27: sum >=23 path (1989 -> 27 -> 9), personality = soul = 9", () => {
    const r = getPersonalitySoul({ year: 1954, month: 8, day: 27 });
    expect(r.personality).toBe(9);
    expect(r.soul).toBe(9);
  });

  it("1965-08-20: 22-swap special case -> personality 4, soul 0 (자리이타 고유 규칙)", () => {
    const r = getPersonalitySoul({ year: 1965, month: 8, day: 20 });
    expect(r.isTwentyTwoSpecial).toBe(true);
    expect(r.personality).toBe(4);
    expect(r.soul).toBe(0);
  });

  it("1958-02-21: 19-special case -> personality 19, soul reduces 19->10->1", () => {
    const r = getPersonalitySoul({ year: 1958, month: 2, day: 21 });
    expect(r.personality).toBe(19);
    expect(r.soul).toBe(1);
    expect(r.isNineteenSpecial).toBe(true);
  });
});

describe("getYearCardNumber", () => {
  it("matches the PDF worked example: 2026 + 4 + 23 -> 10", () => {
    expect(getYearCardNumber(2026, 4, 23)).toBe(10);
  });
});

describe("getPersonalYearAnchor", () => {
  it("uses this calendar year once the birthday has passed", () => {
    const ref = new Date(2024, 4, 30); // 2024-05-30, birthday 5/24 already passed
    expect(getPersonalYearAnchor(ref, 5, 24)).toBe(2024);
  });

  it("uses the previous calendar year before the birthday", () => {
    const ref = new Date(2024, 3, 30); // 2024-04-30, birthday 5/24 not yet reached
    expect(getPersonalYearAnchor(ref, 5, 24)).toBe(2023);
  });

  it("treats the birthday itself as already-passed (inclusive)", () => {
    const ref = new Date(2024, 4, 24); // exactly on birthday
    expect(getPersonalYearAnchor(ref, 5, 24)).toBe(2024);
  });
});

describe("computeAllCards", () => {
  it("computes a full set consistently for a sample client", () => {
    const result = computeAllCards(
      { year: 2000, month: 5, day: 24 },
      new Date(2024, 3, 30) // 상담일 2024-04-30, 생일 전이므로 anchor=2023
    );
    expect(result.personality).toBe(13);
    expect(result.soul).toBe(4);
    expect(result.anchorYear).toBe(2023);
    expect(result.thisYear).toBe(getYearCardNumber(2023, 5, 24));
    expect(result.lastYear).toBe(getYearCardNumber(2022, 5, 24));
    expect(result.nextYear).toBe(getYearCardNumber(2024, 5, 24));
  });
});

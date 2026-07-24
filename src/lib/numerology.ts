/**
 * 자리이타(自利利他) 방식 수비학 계산 엔진
 *
 * 근거: 자리이타타로 강의자료(PDF) 05/09/11 섹션.
 * 핵심 규칙은 세 가지 계산법(가로셈/년월일별 합산/그대로 더하기)이
 * "영혼카드"에서는 항상 같은 결과로 수렴하지만, "성격카드"·"년도카드"처럼
 * 0~21 범위에서 먼저 멈추는 계산에서는 그룹핑 방식에 따라 결과가 달라질 수 있다.
 * 자리이타는 이 경우 반드시 "아래로 더하기" 방식(대상수를 그대로 더한 뒤
 * 그 총합의 자릿수를 한 번에 더하는 방식)을 공식 계산법으로 삼는다.
 */

export type BirthDate = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
};

/** 정수를 이루는 모든 자릿수를 더한다 (예: 2006 -> 2+0+0+6 = 8). */
export function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);
}

/**
 * 성격카드 / 년도카드(올해·작년·내년)에 공통으로 쓰이는 축약 규칙.
 * 0~21 범위 안에서 멈추며, 22는 0으로 취급(더 이상 축약하지 않음).
 * 23 이상이면 자릿수를 한 번 더 더해 재시도한다.
 */
export function reduceToCardRange(rawTotal: number): number {
  let s = digitSum(rawTotal);
  // 실용적인 생년월일 범위에서는 한 번의 추가 축약이면 충분하지만,
  // 혹시 모를 극단값을 대비해 안전하게 반복한다.
  while (s > 21) {
    if (s === 22) return 0;
    s = digitSum(s);
  }
  return s;
}

export type PersonalitySoulResult = {
  /** 성격카드 번호 (0~21, 22 스왑 규칙 적용 후) */
  personality: number;
  /** 영혼카드 번호 (1~9, 22 스왑 시에는 0) */
  soul: number;
  /** 계산 중간값이 19였는지 (19/10/1 모두 의미를 갖는 자리이타 특수 케이스) */
  isNineteenSpecial: boolean;
  /** 계산 중간값이 22였는지 (자리이타 고유 스왑 규칙 적용 케이스) */
  isTwentyTwoSpecial: boolean;
};

/**
 * 성격카드와 영혼카드를 함께 계산한다.
 *
 * 원칙: raw = 생년 + 생월 + 생일 (정수 그대로), s = digitSum(raw).
 * - s가 0~21이면 그대로 성격카드.
 * - s가 22이면: 원래 관례는 성격=0(바보)/영혼=4이지만,
 *   자리이타는 이를 뒤집어 **성격=4, 영혼=0(바보)** 로 계산한다. (자리이타 고유 규칙)
 * - s가 23 이상이면 한 번 더 자릿수를 더해 재시도.
 * - 영혼카드는 성격카드 값을 9 이하가 될 때까지 반복해서 자릿수를 더한 값.
 *   (예: 19->10->1, 21->3, 13->4, 12->3)
 */
export function getPersonalitySoul(birth: BirthDate): PersonalitySoulResult {
  const raw = birth.year + birth.month + birth.day;
  let s = digitSum(raw);
  let isTwentyTwoSpecial = false;

  while (s > 22) {
    s = digitSum(s);
  }
  if (s === 22) {
    isTwentyTwoSpecial = true;
  }

  if (isTwentyTwoSpecial) {
    return {
      personality: 4,
      soul: 0,
      isNineteenSpecial: false,
      isTwentyTwoSpecial: true,
    };
  }

  const personality = s;
  let soul = personality;
  while (soul > 9) {
    soul = digitSum(soul);
  }

  return {
    personality,
    soul,
    isNineteenSpecial: personality === 19,
    isTwentyTwoSpecial: false,
  };
}

/**
 * 특정 연도를 기준으로 한 년도카드(0~21) 계산.
 * 성격카드와 동일한 축약 규칙을 쓰되, 22는 그대로 0(바보)으로 취급하며
 * 스왑 규칙은 적용하지 않는다 (년도카드는 짝을 이루는 영혼카드가 없으므로).
 */
export function getYearCardNumber(
  targetYear: number,
  birthMonth: number,
  birthDay: number
): number {
  const raw = targetYear + birthMonth + birthDay;
  return reduceToCardRange(raw);
}

/**
 * 생일을 기준으로 한 "개인년도(personal year)"의 기준 연도를 구한다.
 * 자리이타 자료(11섹션 상담기록지)에 따르면 년도카드는 1/1~12/31 달력년도가 아니라
 * 생일부터 다음 생일 전날까지를 한 주기로 삼는다.
 * 기준일(상담일 등)이 그 해의 생일을 이미 지났으면 기준일의 연도가 anchor,
 * 아직 생일 전이면 전년도가 anchor가 된다.
 */
export function getPersonalYearAnchor(
  referenceDate: Date,
  birthMonth: number,
  birthDay: number
): number {
  const refYear = referenceDate.getFullYear();
  const thisYearBirthday = new Date(refYear, birthMonth - 1, birthDay);
  // 시/분 영향을 없애기 위해 날짜만 비교
  const refDateOnly = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  return refDateOnly >= thisYearBirthday ? refYear : refYear - 1;
}

export type AllCardsResult = {
  personality: number;
  soul: number;
  lastYear: number;
  thisYear: number;
  nextYear: number;
  anchorYear: number;
  isNineteenSpecial: boolean;
  isTwentyTwoSpecial: boolean;
};

/** 성격/영혼/작년/올해/내년 카드를 한 번에 계산한다. */
export function computeAllCards(
  birth: BirthDate,
  referenceDate: Date = new Date()
): AllCardsResult {
  const { personality, soul, isNineteenSpecial, isTwentyTwoSpecial } =
    getPersonalitySoul(birth);
  const anchorYear = getPersonalYearAnchor(
    referenceDate,
    birth.month,
    birth.day
  );

  return {
    personality,
    soul,
    lastYear: getYearCardNumber(anchorYear - 1, birth.month, birth.day),
    thisYear: getYearCardNumber(anchorYear, birth.month, birth.day),
    nextYear: getYearCardNumber(anchorYear + 1, birth.month, birth.day),
    anchorYear,
    isNineteenSpecial,
    isTwentyTwoSpecial,
  };
}

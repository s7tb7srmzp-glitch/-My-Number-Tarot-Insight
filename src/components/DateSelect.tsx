"use client";

import { useState } from "react";

type Props = {
  label: string;
  required?: boolean;
  value: string; // YYYY-MM-DD 또는 빈 문자열 (초기값으로만 사용)
  onChange: (value: string) => void;
  hint?: string;
  /** 연도 select에 보여줄 범위 */
  yearFrom?: number;
  yearTo?: number;
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseValue(value: string): { year: string; month: string; day: string } {
  const [y, m, d] = value.split("-");
  return {
    year: y || "",
    month: m ? String(Number(m)) : "",
    day: d ? String(Number(d)) : "",
  };
}

const selectClass =
  "flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

export default function DateSelect({
  label,
  required,
  value,
  onChange,
  hint,
  yearFrom,
  yearTo,
}: Props) {
  const currentYear = new Date().getFullYear();
  const maxYear = yearTo ?? currentYear + 1;
  const minYear = yearFrom ?? currentYear - 100;

  // 부모의 value는 초기값으로만 쓰고, 이후로는 이 컴포넌트가 각 select의
  // 선택 상태를 직접 들고 있는다. (매번 부모 value로부터 다시 파싱하면
  // 년/월/일 중 하나만 골랐을 때 아직 완성되지 않은 값이라 부모가 ""로
  // 되돌려버려서, 방금 고른 값이 화면에서 사라져 보이는 문제가 있었음)
  const [local, setLocal] = useState(() => parseValue(value));

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay =
    local.year && local.month ? daysInMonth(Number(local.year), Number(local.month)) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  function update(next: { year: string; month: string; day: string }) {
    setLocal(next);
    if (!next.year || !next.month || !next.day) {
      onChange("");
      return;
    }
    const clampedDay = Math.min(
      Number(next.day),
      daysInMonth(Number(next.year), Number(next.month))
    );
    const mm = String(next.month).padStart(2, "0");
    const dd = String(clampedDay).padStart(2, "0");
    onChange(`${next.year}-${mm}-${dd}`);
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm text-ink">
      <span>
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="flex gap-2">
        <select
          aria-label={`${label} 연도`}
          className={selectClass}
          value={local.year}
          onChange={(e) => update({ ...local, year: e.target.value })}
        >
          <option value="">연도</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} 월`}
          className={selectClass}
          value={local.month}
          onChange={(e) => update({ ...local, month: e.target.value })}
        >
          <option value="">월</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} 일`}
          className={selectClass}
          value={local.day}
          onChange={(e) => update({ ...local, day: e.target.value })}
        >
          <option value="">일</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}일
            </option>
          ))}
        </select>
      </div>
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </div>
  );
}

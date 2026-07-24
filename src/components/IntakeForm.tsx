"use client";

import { useState } from "react";
import DateSelect from "@/components/DateSelect";
import type { IntakeInput } from "@/lib/types";

type Props = {
  onSubmit: (input: IntakeInput) => void;
  submitting: boolean;
};

function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function IntakeForm({ onSubmit, submitting }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [consultDate, setConsultDate] = useState(todayIso());
  const [questions, setQuestions] = useState(["", "", ""]);
  const [error, setError] = useState<string | null>(null);

  function handleQuestionChange(index: number, value: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!birthDate) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    const [yStr, mStr, dStr] = birthDate.split("-");
    const year = Number(yStr);
    const month = Number(mStr);
    const day = Number(dStr);
    if (!year || !month || !day) {
      setError("생년월일 형식을 확인해주세요.");
      return;
    }

    const trimmedAge = age.trim();
    const parsedAge = trimmedAge ? Number(trimmedAge) : undefined;

    onSubmit({
      name: name.trim(),
      birth: { year, month, day },
      consultDate: consultDate || todayIso(),
      questions: questions.map((q) => q.trim()).filter(Boolean).slice(0, 3),
      age: parsedAge && Number.isFinite(parsedAge) ? parsedAge : undefined,
      occupation: occupation.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto flex flex-col gap-5 rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8"
    >
      <div className="text-center">
        <p className="text-sm tracking-widest text-rose-500">윤슬의 수비학 타로</p>
        <h1 className="mt-1 text-2xl font-medium text-ink sm:text-3xl">
          나의 숫자, 나의 이야기
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          생년월일을 입력하면 성격 · 영혼 · 작년 · 올해 · 내년 카드를 자동으로 계산해
          당신의 삶이 흘러온 이야기를 들려드려요.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-ink">
        이름 <span className="text-ink-soft">(선택)</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="상담을 받으실 분의 이름"
          className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
          나이 <span className="text-ink-soft">(선택)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="예: 35"
            className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
          직업 <span className="text-ink-soft">(선택)</span>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="예: 회사원"
            maxLength={40}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        </label>
      </div>
      <p className="-mt-3 text-xs text-ink-soft">
        나이·직업을 알려주시면 조언을 그 상황에 맞게 조정해드려요.
      </p>

      <DateSelect
        label="생년월일"
        required
        value={birthDate}
        onChange={setBirthDate}
      />

      <DateSelect
        label="상담 기준일"
        value={consultDate}
        onChange={(v) => setConsultDate(v || todayIso())}
        hint="올해/작년/내년 카드는 생일을 기준으로 계산돼요. 기본값은 오늘 날짜예요."
        yearFrom={new Date().getFullYear() - 1}
        yearTo={new Date().getFullYear() + 1}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink">
          궁금한 점 <span className="text-ink-soft">(선택, 최대 3개)</span>
        </p>
        {questions.map((q, i) => (
          <input
            key={i}
            type="text"
            value={q}
            onChange={(e) => handleQuestionChange(i, e.target.value)}
            placeholder={`질문 ${i + 1}`}
            maxLength={120}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        ))}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-medium tracking-wide text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "카드를 계산하고 있어요..." : "카드 계산하고 상담 시작하기"}
      </button>
    </form>
  );
}

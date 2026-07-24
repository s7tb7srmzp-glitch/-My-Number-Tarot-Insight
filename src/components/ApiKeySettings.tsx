"use client";

import { useEffect, useState } from "react";
import { getStoredApiKey, setStoredApiKey } from "@/lib/apiKeyStore";

export default function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [input, setInput] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    // 정적 export라 서버 렌더 결과는 항상 hasKey=false. 하이드레이션 불일치를
    // 피하기 위해 마운트 이후에만 localStorage 값으로 동기화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasKey(Boolean(getStoredApiKey()));
  }, []);

  function handleSave() {
    setStoredApiKey(input);
    setHasKey(Boolean(input.trim()));
    setInput("");
    setSavedMessage(input.trim() ? "저장했어요." : "삭제했어요.");
    setTimeout(() => setSavedMessage(null), 2000);
  }

  function handleClear() {
    setStoredApiKey("");
    setHasKey(false);
    setInput("");
    setSavedMessage("삭제했어요.");
    setTimeout(() => setSavedMessage(null), 2000);
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-ink-soft underline underline-offset-2"
      >
        {hasKey ? "AI 설정 (키 등록됨)" : "AI 서사 설정 (선택)"}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-xs leading-relaxed text-ink-soft">
            Anthropic API 키를 넣으면 다섯 장의 카드를 서사형으로 풀어주는 AI 해석이
            켜져요. 키는 이 브라우저에만 저장되고 다른 곳으로 전송되지 않으며, 해석을
            생성할 때 이 브라우저에서 Anthropic API로 직접 전송돼요. 키가 없어도 기본
            서사로 정상 이용할 수 있어요.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasKey ? "새 키로 교체하려면 입력" : "sk-ant-..."}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!input.trim()}
              className="rounded-full bg-rose-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              저장
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-rose-300 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              >
                키 삭제
              </button>
            )}
            {savedMessage && (
              <span className="text-xs text-ink-soft">{savedMessage}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * Anthropic API 키를 이 브라우저(localStorage)에만 저장한다.
 * 정적 사이트(GitHub Pages)로 배포하므로 서버에 보관할 곳이 없고,
 * 저장소 코드나 빌드 결과물에도 절대 포함되지 않는다 — 오직 사용자의 브라우저에만 남는다.
 */
const STORAGE_KEY = "numerology-tarot:anthropic-api-key";

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key.trim()) {
      window.localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage를 쓸 수 없는 환경(프라이빗 모드 등)에서는 조용히 무시
  }
}

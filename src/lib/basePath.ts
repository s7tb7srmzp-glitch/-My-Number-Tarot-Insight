/**
 * GitHub Pages 프로젝트 사이트는 https://<user>.github.io/<repo>/ 하위 경로로 서빙된다.
 * next.config.ts의 basePath와 동일한 값을 빌드 타임에 주입받아,
 * (next/image, next/link 등 Next.js가 자동으로 처리해주지 않는) 순수 문자열 경로에
 * 수동으로 붙여줄 때 사용한다. 예: @react-pdf/renderer의 Font.register/Image src.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_PATH}${path}`;
}

import type { NextConfig } from "next";

// GitHub Pages는 프로젝트 저장소를 /<repo-name>/ 하위 경로로 서빙하므로,
// 배포 워크플로에서 NEXT_PUBLIC_BASE_PATH로 저장소 이름을 넘겨준다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    // GitHub Pages는 정적 파일만 서빙하므로 Next.js 이미지 최적화 서버를 쓸 수 없음
    unoptimized: true,
  },
};

export default nextConfig;

# 자리이타 수비학 타로 상담 앱

내담자의 생년월일만 입력하면 **자리이타(自利利他) 방식** 수비학으로 성격카드·영혼카드·작년/올해/내년 카드를 자동 계산하고, 다섯 장의 흐름을 AI가 따뜻한 상담사 말투로 서사화해주는 상담 도구입니다. 결과는 로즈골드·베이지 톤의 모바일 반응형 화면으로 보여주고, 버튼 한 번으로 PDF 상담 리포트를 다운로드할 수 있습니다.

정적 사이트(별도 서버 없음)로 빌드되어 **GitHub Pages**로 배포되며, 홈 화면에 추가하면 PWA로 설치되어 브라우저 주소창 없이 앱처럼 열립니다.

## 계산법 (자리이타 방식)

- **성격카드 / 올해·작년·내년카드**: `대상연도 + 생월 + 생일`을 그대로 더한 뒤(raw sum), 그 결과의 자릿수를 더해 0~21 범위 안에서 멈춥니다(10~21도 축약하지 않음). 22가 나오면 0으로, 23 이상이면 한 번 더 자릿수를 더합니다.
- **영혼카드**: 성격카드 값을 9 이하가 될 때까지 반복해서 자릿수를 더합니다.
- **22의 특수 규칙(자리이타 고유)**: 원래 관례는 성격=0/영혼=4이지만, 자리이타는 이를 뒤집어 **성격=4, 영혼=0(바보)** 으로 계산합니다.
- **올해/작년/내년카드**는 1/1~12/31 달력년도가 아니라 **생일 기준 개인년도(personal year)** 로 계산합니다. 상담 기준일이 그 해의 생일을 지났으면 기준일의 연도가, 아직 지나지 않았으면 전년도가 anchor가 됩니다.

자세한 근거와 검증된 예시는 `src/lib/numerology.ts`, `src/lib/numerology.test.ts`를 참고하세요.

## GitHub Pages로 배포하기

1. GitHub 저장소 **Settings → Pages** 에서 Source를 **GitHub Actions**로 설정합니다 (처음 한 번만).
2. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 후 GitHub Pages에 배포합니다. 수동으로 돌리고 싶으면 Actions 탭에서 `Deploy to GitHub Pages` 워크플로를 `Run workflow`로 실행할 수 있습니다.
3. 배포가 끝나면 `https://<계정>.github.io/<저장소 이름>/` 주소로 접속할 수 있습니다.
4. 핸드폰 브라우저로 그 주소를 열고 공유 메뉴(iOS) 또는 메뉴(Android Chrome)에서 **"홈 화면에 추가"** 를 누르면, 이후로는 브라우저 주소창 없이 앱처럼 아이콘을 눌러 바로 열립니다.

이 앱은 서버가 없는 완전한 정적 사이트라 GitHub Pages만으로 배포가 끝납니다. `next.config.ts`의 `NEXT_PUBLIC_BASE_PATH`는 배포 워크플로가 저장소 이름으로 자동 설정해주므로 직접 건드릴 필요는 없습니다.

### AI 서사 연동 (선택)

이 앱은 서버가 없어서 API 키를 안전하게 보관할 서버 쪽 저장소가 없습니다. 대신 화면 하단의 **"AI 서사 설정"** 에서 자신의 Anthropic API 키를 입력하면, 그 브라우저에만 저장되고([localStorage](https://developer.mozilla.org/ko/docs/Web/API/Window/localStorage)) 해석을 만들 때마다 그 브라우저에서 Anthropic API로 직접 전송됩니다. 저장소 코드나 빌드 결과물에는 어떤 키도 포함되지 않습니다.

- 키를 넣으면: 다섯 장의 카드를 서사형으로 풀어주는 AI 해석이 켜집니다.
- 키가 없으면: 카드 데이터를 조합한 규칙 기반 서사(`src/lib/fallbackNarrative.ts`)로 정상 동작합니다.
- ⚠️ 개인용으로만 쓰는 걸 전제로 한 방식입니다. URL을 다른 사람과 공유하면 그 사람도 자신의 키를 넣어야 AI 해석을 쓸 수 있고, 서로의 키가 섞이지 않습니다(각자 자신의 브라우저에만 저장되므로).

## 로컬 개발

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 테스트 / 정적 빌드 확인

```bash
npm test         # 수비학 계산 엔진 유닛 테스트 (vitest)
npm run lint
npm run build     # out/ 폴더에 정적 사이트 생성
npm run start     # out/ 폴더를 로컬에서 정적 서빙 (serve)
```

## 프로젝트 구조

```
src/lib/numerology.ts        # 자리이타 계산 엔진 (순수 함수)
src/lib/cardData.ts          # 메이저 아르카나 22장 해석 데이터
src/lib/prompt.ts            # Claude 프롬프트 빌더 (시스템 프롬프트 + 도구 스키마)
src/lib/interpretClient.ts   # 브라우저에서 직접 Anthropic API 호출 + 폴백 처리
src/lib/apiKeyStore.ts       # API 키 localStorage 저장/조회
src/lib/fallbackNarrative.ts # AI 키 없을 때의 규칙 기반 서사
src/lib/basePath.ts          # GitHub Pages 서브패스 대응 헬퍼
src/components/              # 입력 폼, 결과 화면, 카드 UI, AI 설정 패널
src/components/pdf/          # @react-pdf/renderer 리포트 문서
public/cards/0.jpg~21.jpg    # 라이더-웨이트 덱 메이저 아르카나 이미지
public/fonts/                # PDF 임베드용 Noto Serif KR(OFL)
public/manifest.webmanifest  # PWA 매니페스트
.github/workflows/deploy.yml # GitHub Pages 자동 배포 워크플로
```

## 이미지 사용에 대한 참고

`public/cards/`의 타로 카드 이미지는 1909년 라이더-웨이트-스미스 덱(퍼블릭 도메인 삽화)을 촬영/스캔한 이미지입니다. 원화 자체는 저작권이 만료되었지만, 첨부해주신 스캔본의 2차 출처가 명확하지 않으니 실제 서비스 배포 전에 이미지 사용 권리를 한 번 더 확인하시는 것을 권장드립니다.

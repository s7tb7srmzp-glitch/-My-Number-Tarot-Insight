# 자리이타 수비학 타로 상담 앱

내담자의 생년월일만 입력하면 **자리이타(自利利他) 방식** 수비학으로 성격카드·영혼카드·작년/올해/내년 카드를 자동 계산하고, 다섯 장의 흐름을 AI가 따뜻한 상담사 말투로 서사화해주는 상담 도구입니다. 결과는 로즈골드·베이지 톤의 모바일 반응형 화면으로 보여주고, 버튼 한 번으로 PDF 상담 리포트를 다운로드할 수 있습니다.

## 계산법 (자리이타 방식)

- **성격카드 / 올해·작년·내년카드**: `대상연도 + 생월 + 생일`을 그대로 더한 뒤(raw sum), 그 결과의 자릿수를 더해 0~21 범위 안에서 멈춥니다(10~21도 축약하지 않음). 22가 나오면 0으로, 23 이상이면 한 번 더 자릿수를 더합니다.
- **영혼카드**: 성격카드 값을 9 이하가 될 때까지 반복해서 자릿수를 더합니다.
- **22의 특수 규칙(자리이타 고유)**: 원래 관례는 성격=0/영혼=4이지만, 자리이타는 이를 뒤집어 **성격=4, 영혼=0(바보)** 으로 계산합니다.
- **올해/작년/내년카드**는 1/1~12/31 달력년도가 아니라 **생일 기준 개인년도(personal year)** 로 계산합니다. 상담 기준일이 그 해의 생일을 지났으면 기준일의 연도가, 아직 지나지 않았으면 전년도가 anchor가 됩니다.

자세한 근거와 검증된 예시는 `src/lib/numerology.ts`, `src/lib/numerology.test.ts`를 참고하세요.

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### AI 서사 연동 (선택)

`.env.local` 파일을 만들고 Anthropic API 키를 넣으면 카드 다섯 장을 서사형으로 풀어주는 AI 해석이 활성화됩니다.

```bash
cp .env.example .env.local
# .env.local 안에 ANTHROPIC_API_KEY 값을 채워주세요
```

키가 없어도 앱은 정상 동작합니다 — 이 경우 카드 데이터를 조합한 규칙 기반 서사(`src/lib/fallbackNarrative.ts`)로 대체됩니다.

### 테스트

```bash
npm test    # 수비학 계산 엔진 유닛 테스트 (vitest)
npm run lint
npm run build
```

## 프로젝트 구조

```
src/lib/numerology.ts       # 자리이타 계산 엔진 (순수 함수)
src/lib/cardData.ts         # 메이저 아르카나 22장 해석 데이터
src/lib/prompt.ts           # Claude 프롬프트 빌더
src/lib/fallbackNarrative.ts# AI 키 없을 때의 규칙 기반 서사
src/app/api/interpret/      # AI 해석 API Route (서버 사이드)
src/components/             # 입력 폼, 결과 화면, 카드 UI
src/components/pdf/         # @react-pdf/renderer 리포트 문서
public/cards/0.jpg~21.jpg   # 라이더-웨이트 덱 메이저 아르카나 이미지
public/fonts/               # PDF 임베드용 Noto Serif KR(OFL)
```

## 이미지 사용에 대한 참고

`public/cards/`의 타로 카드 이미지는 1909년 라이더-웨이트-스미스 덱(퍼블릭 도메인 삽화)을 촬영/스캔한 이미지입니다. 원화 자체는 저작권이 만료되었지만, 첨부해주신 스캔본의 2차 출처가 명확하지 않으니 실제 서비스 배포 전에 이미지 사용 권리를 한 번 더 확인하시는 것을 권장드립니다.

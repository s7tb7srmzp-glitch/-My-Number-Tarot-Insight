import { Document, Page, View, Text, Image, Font, StyleSheet, Svg, Path, Circle } from "@react-pdf/renderer";
import { getCardById } from "@/lib/cardData";
import { withBasePath } from "@/lib/basePath";
import { groupSections } from "@/lib/sectionGrouping";
import type { AllCardsResult } from "@/lib/numerology";
import type { IntakeInput, NarrativeSection } from "@/lib/types";

let fontsRegistered = false;
function ensureFontsRegistered() {
  if (fontsRegistered) return;
  Font.register({
    family: "NotoSerifKR",
    fonts: [
      { src: withBasePath("/fonts/NotoSerifKR-Regular.ttf"), fontWeight: "normal" },
      { src: withBasePath("/fonts/NotoSerifKR-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  Font.register({
    family: "NanumMyeongjo",
    fonts: [
      { src: withBasePath("/fonts/NanumMyeongjo-Regular.ttf"), fontWeight: "normal" },
      { src: withBasePath("/fonts/NanumMyeongjo-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  Font.register({
    family: "NanumGothic",
    fonts: [
      { src: withBasePath("/fonts/NanumGothic-Regular.ttf"), fontWeight: "normal" },
      { src: withBasePath("/fonts/NanumGothic-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  // 긴 한글 문장 줄바꿈 시 단어(글자) 단위 하이픈 분리를 막는다.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const ROSE = "#B76E79";
const ROSE_DARK = "#7E4550";
const SAND_BG = "#FDFBF7";
const SAND_LINE = "#EFE3D3";
const INK = "#4A3B35";
const INK_SOFT = "#7A6A5F";
const INK_DEEP = "#2A1F1B";
const META_GRAY = "#8C8C8C";
const GLINT_GOLD = "#C9A15D";

const styles = StyleSheet.create({
  page: {
    backgroundColor: SAND_BG,
    fontFamily: "NotoSerifKR",
    color: INK,
    padding: 40,
    paddingBottom: 56,
    fontSize: 16,
    lineHeight: 1.6,
  },
  headerLabel: {
    fontSize: 13,
    letterSpacing: 2,
    color: ROSE,
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: INK,
    lineHeight: 1.3,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    color: INK_SOFT,
    marginBottom: 20,
  },
  pageHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: INK,
    textAlign: "center",
    marginBottom: 12,
  },
  yearNote: {
    fontSize: 14,
    color: INK_SOFT,
    textAlign: "center",
    marginBottom: 18,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  cardCol: {
    width: "30%",
    alignItems: "center",
  },
  cardColWide: {
    width: "22%",
    alignItems: "center",
  },
  cardRole: {
    fontSize: 13,
    color: ROSE_DARK,
    marginBottom: 4,
    textAlign: "center",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 0.62,
    borderRadius: 4,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 13,
    textAlign: "center",
    color: INK,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: SAND_LINE,
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: "bold",
    color: ROSE_DARK,
    marginBottom: 9,
  },
  sectionBody: {
    fontSize: 17,
    color: INK,
    marginBottom: 18,
    textAlign: "justify",
  },
  closing: {
    fontSize: 15,
    color: INK_SOFT,
    marginTop: 6,
    textAlign: "justify",
  },
  questionText: {
    fontSize: 14,
    color: ROSE_DARK,
    fontWeight: "bold",
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 11,
    color: INK_SOFT,
    textAlign: "center",
  },
  coverPage: {
    backgroundColor: SAND_BG,
    fontFamily: "NanumGothic",
    padding: 56,
    flexDirection: "column",
  },
  coverRunningHead: {
    fontFamily: "NanumGothic",
    fontSize: 13,
    letterSpacing: 3,
    color: ROSE_DARK,
    textAlign: "center",
  },
  coverBlock: {
    alignItems: "center",
  },
  coverTitle: {
    fontFamily: "NanumMyeongjo",
    fontWeight: "bold",
    fontSize: 39,
    color: INK_DEEP,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 14,
  },
  coverSubtitle: {
    fontFamily: "NanumMyeongjo",
    fontSize: 18,
    color: ROSE_DARK,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  coverDateLabel: {
    fontFamily: "NanumGothic",
    fontSize: 15,
    color: META_GRAY,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  coverFooterLine: {
    fontFamily: "NanumGothic",
    fontSize: 12,
    color: INK_SOFT,
    textAlign: "center",
    marginTop: 4,
  },
});

function Footer() {
  return (
    <Text style={styles.footer} fixed>
      윤슬의 수비학 타로 상담 리포트 · 본 리포트는 성찰과 위로를 위한 참고 자료입니다.
    </Text>
  );
}

/**
 * "윤슬"(햇빛에 반짝이는 잔물결) 모티프의 절제된 장식.
 * 얇은 물결 선 두 줄 + 옅은 빛 알갱이(작은 점) 몇 개로만 구성해 과하지 않게 표현한다.
 */
function RippleOrnament() {
  return (
    <Svg width="220" height="30" viewBox="0 0 220 30">
      <Path
        d="M0 14 C 18 4, 36 4, 55 14 S 92 24, 110 14 S 147 4, 165 14 S 202 24, 220 14"
        stroke={ROSE}
        strokeWidth={0.8}
        strokeOpacity={0.55}
        fill="none"
      />
      <Path
        d="M10 21 C 28 13, 46 13, 64 21 S 100 29, 118 21 S 155 13, 173 21 S 209 29, 220 22"
        stroke={ROSE_DARK}
        strokeWidth={0.6}
        strokeOpacity={0.3}
        fill="none"
      />
      <Circle cx={30} cy={8} r={1.1} fill={GLINT_GOLD} fillOpacity={0.55} />
      <Circle cx={78} cy={6} r={0.7} fill={ROSE} fillOpacity={0.45} />
      <Circle cx={128} cy={9} r={0.9} fill={GLINT_GOLD} fillOpacity={0.4} />
      <Circle cx={172} cy={6} r={0.6} fill={ROSE_DARK} fillOpacity={0.4} />
      <Circle cx={200} cy={9} r={1} fill={ROSE} fillOpacity={0.4} />
    </Svg>
  );
}

function CoverPage({ nameLabel, consultDate }: { nameLabel: string; consultDate: string }) {
  return (
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.coverRunningHead}>윤 슬 의 수 비 학 타 로 상 담 리 포 트</Text>

      <View style={{ flex: 1.3 }} />

      <View style={styles.coverBlock}>
        <RippleOrnament />
        <Text style={styles.coverTitle}>{nameLabel}의 이야기</Text>
        <Text style={styles.coverSubtitle}>타고난 나, 그리고 3년의 흐름</Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.coverBlock}>
        <Text style={styles.coverDateLabel}>상담 기준일 {consultDate}</Text>
      </View>

      <View style={{ flex: 0.7 }} />

      <View style={styles.coverBlock}>
        <Text style={styles.coverFooterLine}>본 리포트는 성찰과 위로를 위한 참고 자료입니다</Text>
        <Text style={styles.coverFooterLine}>카드 해석은 고유의 수비학 체계를 바탕으로 합니다</Text>
      </View>
    </Page>
  );
}

function SectionBlock({ section }: { section: NarrativeSection }) {
  return (
    <View>
      <Text style={styles.sectionHeading}>{section.heading}</Text>
      <Text style={styles.sectionBody}>{section.body}</Text>
    </View>
  );
}

type Props = {
  input: IntakeInput;
  cards: AllCardsResult;
  sections: NarrativeSection[];
  closing: string;
};

export default function ReportDocument({ input, cards, sections, closing }: Props) {
  ensureFontsRegistered();
  const nameLabel = input.name?.trim() ? `${input.name.trim()}님` : "내담자님";

  const {
    core: coreSections,
    flow: flowSections,
    question: questionSections,
    other: otherSections,
  } = groupSections(sections, input.questions);

  const hasQuestionPage = questionSections.length > 0;
  const birthdayLabel = `${input.birth.month}월 ${input.birth.day}일`;

  return (
    <Document title={`${nameLabel} · 윤슬의 수비학 타로 상담 리포트`}>
      {/* 표지 */}
      <CoverPage nameLabel={nameLabel} consultDate={input.consultDate} />

      {/* 1페이지: 타고난 나 — 카드 스프레드만 (설명은 다음 페이지) */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerLabel}>윤슬의 수비학 타로 상담 리포트</Text>
        <Text style={styles.title}>{nameLabel}의 이야기</Text>
        <Text style={styles.subtitle}>
          생년월일 {input.birth.year}.{input.birth.month}.{input.birth.day}
          {"   "}·{"   "}상담 기준일 {input.consultDate}
        </Text>

        <Text style={styles.pageHeading}>타고난 나 — 성격과 영혼</Text>

        <View style={{ flex: 1 }} />

        <View style={styles.coverBlock}>
          <RippleOrnament />
        </View>
        <View style={[styles.cardRow, { marginTop: 18 }]}>
          <View style={styles.cardColWide}>
            <Text style={styles.cardRole}>성격카드</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
            <Image src={withBasePath(getCardById(cards.personality).image)} style={styles.cardImage} />
            <Text style={styles.cardName}>
              {getCardById(cards.personality).id}. {getCardById(cards.personality).nameKo}
            </Text>
          </View>
          <View style={styles.cardColWide}>
            <Text style={styles.cardRole}>영혼카드</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
            <Image src={withBasePath(getCardById(cards.soul).image)} style={styles.cardImage} />
            <Text style={styles.cardName}>
              {getCardById(cards.soul).id}. {getCardById(cards.soul).nameKo}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1.4 }} />

        <Footer />
      </Page>

      {/* 2페이지: 타고난 나 — 설명 (카드와 같은 페이지에 억지로 욱여넣지 않고
          분리해서, 실제 AI 서사처럼 글이 길 때도 카드가 텅 빈 페이지에 덩그러니
          남지 않고 설명이 온전한 한 페이지를 차지하도록 한다). */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.headerLabel}>윤슬의 수비학 타로 상담 리포트</Text>
        <Text style={styles.pageHeading}>타고난 나 — 성격과 영혼</Text>
        <View style={styles.divider} />

        {coreSections.map((s, i) => (
          <SectionBlock key={i} section={s} />
        ))}

        <Footer />
      </Page>

      {/* 3페이지: 3년의 흐름 — 카드 스프레드만 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerLabel}>윤슬의 수비학 타로 상담 리포트</Text>
        <Text style={styles.pageHeading}>3년의 흐름 — 작년 · 올해 · 내년</Text>
        <Text style={styles.yearNote}>
          이 세 장은 1월~12월 달력이 아니라 {nameLabel}의 생일({birthdayLabel})을 기준으로
          나뉘어요. 생일부터 다음 생일 전날까지가 한 해로 이어집니다.
        </Text>

        <View style={{ flex: 1 }} />

        <View style={styles.coverBlock}>
          <RippleOrnament />
        </View>
        <View style={[styles.cardRow, { marginTop: 18 }]}>
          <View style={styles.cardCol}>
            <Text style={styles.cardRole}>작년카드</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
            <Image src={withBasePath(getCardById(cards.lastYear).image)} style={styles.cardImage} />
            <Text style={styles.cardName}>
              {getCardById(cards.lastYear).id}. {getCardById(cards.lastYear).nameKo}
            </Text>
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.cardRole}>올해카드</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
            <Image src={withBasePath(getCardById(cards.thisYear).image)} style={styles.cardImage} />
            <Text style={styles.cardName}>
              {getCardById(cards.thisYear).id}. {getCardById(cards.thisYear).nameKo}
            </Text>
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.cardRole}>내년카드</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
            <Image src={withBasePath(getCardById(cards.nextYear).image)} style={styles.cardImage} />
            <Text style={styles.cardName}>
              {getCardById(cards.nextYear).id}. {getCardById(cards.nextYear).nameKo}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1.4 }} />

        <Footer />
      </Page>

      {/* 4페이지: 3년의 흐름 — 설명 */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.headerLabel}>윤슬의 수비학 타로 상담 리포트</Text>
        <Text style={styles.pageHeading}>3년의 흐름 — 작년 · 올해 · 내년</Text>
        <View style={styles.divider} />

        {flowSections.map((s, i) => (
          <SectionBlock key={i} section={s} />
        ))}

        {otherSections.map((s, i) => (
          <SectionBlock key={`other-${i}`} section={s} />
        ))}

        {!hasQuestionPage && (
          <>
            <View style={styles.divider} />
            <Text style={styles.closing}>{closing}</Text>
          </>
        )}

        <Footer />
      </Page>

      {/* 5페이지: 질문에 대한 답 (질문이 있을 때만) */}
      {hasQuestionPage && (
        <Page size="A4" style={styles.page} wrap>
          <Text style={styles.headerLabel}>윤슬의 수비학 타로 상담 리포트</Text>
          <Text style={styles.pageHeading}>궁금하셨던 점에 대한 답</Text>
          <View style={styles.divider} />

          {questionSections.map((s, i) => (
            <SectionBlock key={i} section={s} />
          ))}

          <View style={styles.divider} />
          <Text style={styles.closing}>{closing}</Text>

          <Footer />
        </Page>
      )}
    </Document>
  );
}

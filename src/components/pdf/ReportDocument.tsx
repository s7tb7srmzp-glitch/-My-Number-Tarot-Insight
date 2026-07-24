import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";
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

const styles = StyleSheet.create({
  page: {
    backgroundColor: SAND_BG,
    fontFamily: "NotoSerifKR",
    color: INK,
    padding: 40,
    paddingBottom: 56,
    fontSize: 10.5,
    lineHeight: 1.6,
  },
  headerLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: ROSE,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: INK,
    lineHeight: 1.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 9,
    color: INK_SOFT,
    marginBottom: 18,
  },
  pageHeading: {
    fontSize: 15,
    fontWeight: "bold",
    color: INK,
    textAlign: "center",
    marginBottom: 8,
  },
  yearNote: {
    fontSize: 9,
    color: INK_SOFT,
    textAlign: "center",
    marginBottom: 16,
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
    fontSize: 8,
    color: ROSE_DARK,
    marginBottom: 3,
    textAlign: "center",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 0.62,
    borderRadius: 4,
    marginBottom: 3,
  },
  cardName: {
    fontSize: 8,
    textAlign: "center",
    color: INK,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: SAND_LINE,
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: ROSE_DARK,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 10.5,
    color: INK,
    marginBottom: 14,
    textAlign: "justify",
  },
  closing: {
    fontSize: 10,
    color: INK_SOFT,
    marginTop: 6,
    textAlign: "justify",
  },
  questionText: {
    fontSize: 9.5,
    color: ROSE_DARK,
    fontWeight: "bold",
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: INK_SOFT,
    textAlign: "center",
  },
});

function Footer() {
  return (
    <Text style={styles.footer} fixed>
      자리이타 수비학 타로 상담 리포트 · 본 리포트는 성찰과 위로를 위한 참고 자료입니다.
    </Text>
  );
}

function SectionBlock({ section }: { section: NarrativeSection }) {
  return (
    <View wrap={false}>
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
  } = groupSections(sections, input.questions.length);

  const hasQuestionPage = questionSections.length > 0;
  const birthdayLabel = `${input.birth.month}월 ${input.birth.day}일`;

  return (
    <Document title={`${nameLabel} 수비학 타로 상담 리포트`}>
      {/* 1페이지: 타고난 나 (성격 + 영혼) */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.headerLabel}>자리이타 수비학 타로 상담 리포트</Text>
        <Text style={styles.title}>{nameLabel}의 이야기</Text>
        <Text style={styles.subtitle}>
          생년월일 {input.birth.year}.{input.birth.month}.{input.birth.day}
          {"   "}·{"   "}상담 기준일 {input.consultDate}
        </Text>

        <Text style={styles.pageHeading}>타고난 나 — 성격과 영혼</Text>

        <View style={styles.cardRow}>
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

        <View style={styles.divider} />

        {coreSections.map((s, i) => (
          <SectionBlock key={i} section={s} />
        ))}

        {!hasQuestionPage && otherSections.length === 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.closing}>{closing}</Text>
          </>
        )}

        <Footer />
      </Page>

      {/* 2페이지: 3년의 흐름 (작년-올해-내년 스프레드) */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.headerLabel}>자리이타 수비학 타로 상담 리포트</Text>
        <Text style={styles.pageHeading}>3년의 흐름 — 작년 · 올해 · 내년</Text>
        <Text style={styles.yearNote}>
          이 세 장은 1월~12월 달력이 아니라 {nameLabel}의 생일({birthdayLabel})을 기준으로
          나뉘어요. 생일부터 다음 생일 전날까지가 한 해로 이어집니다.
        </Text>

        <View style={styles.cardRow}>
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

      {/* 3페이지: 질문에 대한 답 (질문이 있을 때만) */}
      {hasQuestionPage && (
        <Page size="A4" style={styles.page} wrap>
          <Text style={styles.headerLabel}>자리이타 수비학 타로 상담 리포트</Text>
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

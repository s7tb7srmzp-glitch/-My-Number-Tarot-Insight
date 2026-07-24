import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";
import { getCardById } from "@/lib/cardData";
import { withBasePath } from "@/lib/basePath";
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
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cardCol: {
    width: "18%",
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
  questionBlock: {
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

type Props = {
  input: IntakeInput;
  cards: AllCardsResult;
  sections: NarrativeSection[];
  closing: string;
};

export default function ReportDocument({ input, cards, sections, closing }: Props) {
  ensureFontsRegistered();
  const nameLabel = input.name?.trim() ? `${input.name.trim()}님` : "내담자님";

  const cardRoles: { label: string; id: number }[] = [
    { label: "성격카드", id: cards.personality },
    { label: "영혼카드", id: cards.soul },
    { label: "작년카드", id: cards.lastYear },
    { label: "올해카드", id: cards.thisYear },
    { label: "내년카드", id: cards.nextYear },
  ];

  return (
    <Document title={`${nameLabel} 수비학 타로 상담 리포트`}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.headerLabel}>자리이타 수비학 타로 상담 리포트</Text>
        <Text style={styles.title}>{nameLabel}의 다섯 카드 이야기</Text>
        <Text style={styles.subtitle}>
          생년월일 {input.birth.year}.{input.birth.month}.{input.birth.day}
          {"   "}·{"   "}상담 기준일 {input.consultDate}
        </Text>

        <View style={styles.cardRow}>
          {cardRoles.map(({ label, id }) => {
            const card = getCardById(id);
            return (
              <View key={label} style={styles.cardCol}>
                <Text style={styles.cardRole}>{label}</Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
                <Image src={withBasePath(card.image)} style={styles.cardImage} />
                <Text style={styles.cardName}>
                  {card.id}. {card.nameKo}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        {sections.map((section, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        {input.questions.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionHeading}>내담자가 남긴 질문</Text>
            {input.questions.map((q, i) => (
              <Text key={i} style={styles.questionBlock}>
                {i + 1}. {q}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.divider} />
        <Text style={styles.closing}>{closing}</Text>

        <Text style={styles.footer} fixed>
          자리이타 수비학 타로 상담 리포트 · 본 리포트는 성찰과 위로를 위한 참고 자료입니다.
        </Text>
      </Page>
    </Document>
  );
}

import { getCardById } from "@/lib/cardData";
import { withBasePath } from "@/lib/basePath";

type Props = {
  roleLabel: string;
  cardId: number;
  highlight?: boolean;
};

export default function CardBadge({ roleLabel, cardId, highlight }: Props) {
  const card = getCardById(cardId);

  return (
    <div
      className={`flex w-28 flex-shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 text-center shadow-sm sm:w-32 ${
        highlight
          ? "border-rose-400 bg-rose-50"
          : "border-rose-200 bg-white/80"
      }`}
    >
      <span className="text-xs font-medium tracking-wide text-rose-500">
        {roleLabel}
      </span>
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-lg border border-rose-100 bg-sand-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export에서 basePath 경로를 직접 제어하기 위해 next/image 대신 사용 */}
        <img
          src={withBasePath(card.image)}
          alt={`${card.id}번 ${card.nameKo}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-medium text-ink">
          {card.id}. {card.nameKo}
        </p>
        <p className="text-[11px] text-ink-soft">{card.nameEn}</p>
      </div>
    </div>
  );
}

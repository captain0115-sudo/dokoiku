import type { Metadata } from "next";
import AreaVariantPage, { buildAreaMetadata } from "@/components/AreaVariantPage";
import { AREA_VARIANTS } from "@/lib/areaVariants";

// 「今夜泊まれる宿・直前予約」のロングテールSEOページ。
// チェックイン日を常に本日にする(lib/dates.ts tonightRange)ため、
// 静的生成せず1時間ISRで日付ズレを防ぐ。
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  return buildAreaMetadata(params.code, AREA_VARIANTS.tonight);
}

export default function Page({ params }: Props) {
  return <AreaVariantPage code={params.code} variant={AREA_VARIANTS.tonight} />;
}

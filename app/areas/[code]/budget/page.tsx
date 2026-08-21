import type { Metadata } from "next";
import AreaVariantPage, { buildAreaMetadata } from "@/components/AreaVariantPage";
import { AREA_VARIANTS } from "@/lib/areaVariants";

// 1万円以下の格安ホテル限定のロングテールSEOページ(2026-08-21追加)。
// 基本ページ(app/areas/[code]/page.tsx)と同じ描画ロジック
// (components/AreaVariantPage.tsx)を共有し、lib/rakuten.ts の
// SearchFilters.maxCharge で絞り込むだけの差分。
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  return buildAreaMetadata(params.code, AREA_VARIANTS.budget);
}

export default function Page({ params }: Props) {
  return <AreaVariantPage code={params.code} variant={AREA_VARIANTS.budget} />;
}

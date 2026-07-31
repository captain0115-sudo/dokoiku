import type { Metadata } from "next";
import AreaVariantPage, { buildAreaMetadata } from "@/components/AreaVariantPage";
import { AREA_VARIANTS } from "@/lib/areaVariants";

// ページは事前生成せず、初回アクセス時にサーバー側で生成 → 1時間キャッシュ(ISR)。
// 47都道府県ぶんをビルド時に一括生成すると、デプロイのたびに楽天APIへ
// 47回リクエストが飛んでしまうため、この方式にしている。
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  return buildAreaMetadata(params.code, AREA_VARIANTS.weekend);
}

export default function Page({ params }: Props) {
  return <AreaVariantPage code={params.code} variant={AREA_VARIANTS.weekend} />;
}

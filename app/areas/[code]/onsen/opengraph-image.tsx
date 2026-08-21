import { findPrefecture } from "@/lib/prefectures";
import { AREA_OG_IMAGE_SIZE, buildAreaVariantOgImage } from "@/lib/areaOgImage";

export const runtime = "edge";
export const alt = "どこいく | 都道府県の温泉宿 空室状況";
export const size = AREA_OG_IMAGE_SIZE;
export const contentType = "image/png";

type Props = { params: { code: string } };

export default function AreaOnsenOpengraphImage({ params }: Props) {
  const pref = findPrefecture(params.code);
  const name = pref?.name ?? "どこいく";

  return buildAreaVariantOgImage(
    `${name}の温泉宿 空室状況`,
    pref?.catchphrase,
    "温泉宿だけを価格順に一覧表示"
  );
}

import { findPrefecture } from "@/lib/prefectures";
import { AREA_OG_IMAGE_SIZE, buildAreaVariantOgImage } from "@/lib/areaOgImage";

export const runtime = "edge";
export const alt = "どこいく | 都道府県で今夜泊まれる宿(直前予約)";
export const size = AREA_OG_IMAGE_SIZE;
export const contentType = "image/png";

type Props = { params: { code: string } };

export default function AreaTonightOpengraphImage({ params }: Props) {
  const pref = findPrefecture(params.code);
  const name = pref?.name ?? "どこいく";

  return buildAreaVariantOgImage(
    `${name}で今夜泊まれる宿`,
    pref?.catchphrase,
    "直前予約・弾丸旅行にも対応"
  );
}

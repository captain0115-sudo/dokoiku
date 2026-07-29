/**
 * 住所→緯度経度 変換
 * 国土地理院APIを利用（無料・APIキー不要）。
 * 精度を上げたい場合はGoogle Maps Geocoding APIに差し替え可能。
 */
export type GeocodeResult = {
  lat: number;
  lng: number;
  matchedAddress: string;
};

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(
    address
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`);
  }

  const data = (await res.json()) as Array<{
    geometry: { coordinates: [number, number] }; // [lng, lat]
    properties: { title: string };
  }>;

  if (!data || data.length === 0) return null;

  const [lng, lat] = data[0].geometry.coordinates;
  return {
    lat,
    lng,
    matchedAddress: data[0].properties.title,
  };
}

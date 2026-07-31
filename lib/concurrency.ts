/**
 * 同時実行数を絞ってPromiseを実行するヘルパー。
 * 各タスクの成功/失敗は Promise.allSettled と同じ形式で返す。
 *
 * 元々 app/api/hotels/route.ts 内にあったものを、複数エリアを並行取得する
 * 他の画面(お盆特集ページ等)からも使えるよう共通化した。
 */
export async function runWithConcurrencyLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++;
      try {
        const value = await tasks[index]();
        results[index] = { status: "fulfilled", value };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

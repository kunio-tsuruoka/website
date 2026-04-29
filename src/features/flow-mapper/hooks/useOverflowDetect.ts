import { type RefObject, useEffect, useState } from 'react';

// キャンバスがビューポートを超えるかを検知。全画面ボタンを目立たせる判定に使う。
// overflow-x-auto により wrapper の clientWidth は内容と一致するため、scrollWidth では不可。
// バウンディング矩形 vs ビューポートで判定し、縦が画面の3/4超でも overflow とみなす。
export function useOverflowDetect(
  ref: RefObject<HTMLElement | null>,
  deps: ReadonlyArray<unknown>
): boolean {
  const [overflows, setOverflows] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 呼び出し側の deps（layout / fullscreen 等）変化で再計測する
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function check() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const widthOver = rect.right > window.innerWidth + 1 || rect.left < -1;
      const heightOver = rect.height > window.innerHeight * 0.75;
      setOverflows(widthOver || heightOver);
    }
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener('resize', check);
    window.addEventListener('scroll', check, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
      window.removeEventListener('scroll', check);
    };
  }, deps);

  return overflows;
}

const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export type PlayHorizontalScrollHintOptions = {
  /** Time before the hint starts (ms). */
  delayMs?: number;
  /** Duration of one scroll leg, forward or back (ms). */
  durationMs?: number;
};

export type ScrollHintHandle = {
  cancel: () => void;
};

/**
 * Smoothly scrolls a horizontally scrollable element to the end and back once
 * (e.g. to hint that more content is available).
 */
export const playHorizontalScrollHint = (
  element: HTMLElement,
  options?: PlayHorizontalScrollHintOptions,
): ScrollHintHandle => {
  const delayMs = options?.delayMs ?? 0;
  const durationMs = options?.durationMs ?? 2800;

  let aborted = false;
  let rafId = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const cancel = (): void => {
    aborted = true;
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    cancelAnimationFrame(rafId);
  };

  const run = (): void => {
    if (aborted) return;
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    if (maxScrollLeft <= 0) return;

    const start = element.scrollLeft;

    const animateScroll = (
      from: number,
      to: number,
      onDone: () => void,
    ): void => {
      const animStart = performance.now();
      const delta = to - from;
      const step = (now: number): void => {
        if (aborted) return;
        const elapsed = now - animStart;
        const progress = Math.min(elapsed / durationMs, 1);
        element.scrollLeft = from + delta * easeInOutQuad(progress);
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          onDone();
        }
      };
      rafId = requestAnimationFrame(step);
    };

    animateScroll(start, maxScrollLeft, () => {
      if (aborted) return;
      animateScroll(maxScrollLeft, start, () => {});
    });
  };

  timeoutId = setTimeout(run, delayMs);

  return { cancel };
};

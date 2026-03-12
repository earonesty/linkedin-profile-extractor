/**
 * Scrolls the page until document height stops growing.
 * Useful for triggering lazy-loaded content on LinkedIn.
 */
export async function scrollToBottom(
  doc: Document,
  options?: { maxIterations?: number; delayMs?: number; onProgress?: (msg: string) => void }
): Promise<void> {
  const win = doc.defaultView;
  if (!win) return;

  const maxIterations = options?.maxIterations ?? 50;
  const delayMs = options?.delayMs ?? 300;
  let previousHeight = doc.body.scrollHeight;

  for (let i = 0; i < maxIterations; i++) {
    win.scrollTo(0, doc.body.scrollHeight);
    await new Promise((r) => setTimeout(r, delayMs));

    const currentHeight = doc.body.scrollHeight;
    if (currentHeight === previousHeight) {
      // Scroll once more and check again to be sure
      await new Promise((r) => setTimeout(r, delayMs));
      if (doc.body.scrollHeight === currentHeight) {
        options?.onProgress?.(`Scroll complete after ${i + 1} iterations`);
        return;
      }
    }
    previousHeight = currentHeight;
    options?.onProgress?.(`Scrolling... (${i + 1}/${maxIterations})`);
  }
  options?.onProgress?.(`Scroll reached max iterations (${maxIterations})`);
}
